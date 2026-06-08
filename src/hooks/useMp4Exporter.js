import { useEffect, useRef, useState } from 'react';
import { buildMp4ExportPlan } from '../utils/mp4ExportPlan.js';
import { clearMp4Exports, deleteMp4Export, loadMp4Exports, saveMp4Export } from '../utils/mp4Storage.js';
import { safeFilename } from '../utils/projectExport.js';

const MAX_MP4_HISTORY = 8;

export function useMp4Exporter() {
  const objectUrlsRef = useRef(new Set());
  const [mp4Exports, setMp4Exports] = useState([]);
  const [mp4State, setMp4State] = useState({
    status: 'idle',
    message: 'MP4 POC gotowe do uruchomienia.',
    progress: 0,
    activeExportId: ''
  });

  useEffect(() => {
    let cancelled = false;

    loadMp4Exports(MAX_MP4_HISTORY)
      .then((storedItems) => {
        if (cancelled) return;

        const items = storedItems.map((item) => {
          const downloadUrl = URL.createObjectURL(item.blob);
          objectUrlsRef.current.add(downloadUrl);
          return { ...item, downloadUrl };
        });

        setMp4Exports(items);
        if (items.length > 0) {
          setMp4State((current) => ({ ...current, message: `Wczytano ${items.length} lokalnych eksportów MP4.` }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMp4State({ status: 'error', message: 'Nie udało się wczytać historii MP4 z IndexedDB.', progress: 0, activeExportId: '' });
        }
      });

    return () => {
      cancelled = true;
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  async function exportSequenceToMp4(sequence) {
    const plan = buildMp4ExportPlan({ sequence });
    const exportId = `mp4-${Date.now()}`;

    if (plan.status === 'blocked') {
      setMp4State({
        status: 'error',
        message: plan.validation.summary,
        progress: 0,
        activeExportId: exportId
      });
      return;
    }

    setMp4State({ status: 'loading', message: 'Ładuję ffmpeg.wasm...', progress: 2, activeExportId: exportId });

    try {
      const { ffmpeg, fetchFile } = await getLoadedFfmpeg((ratio) => {
        setMp4State({
          status: 'loading',
          message: `Ładuję ffmpeg.wasm... ${Math.round(ratio * 100)}%`,
          progress: Math.max(2, Math.round(ratio * 20)),
          activeExportId: exportId
        });
      });

      setMp4State({ status: 'preparing', message: `Zapisuję ${sequence.frames.length} klatek do virtual FS...`, progress: 25, activeExportId: exportId });
      await prepareVirtualFrames({ ffmpeg, fetchFile, sequence });

      ffmpeg.on('progress', ({ progress }) => {
        setMp4State({
          status: 'encoding',
          message: `Koduję MP4... ${Math.round(progress * 100)}%`,
          progress: 30 + Math.round(progress * 60),
          activeExportId: exportId
        });
      });

      setMp4State({ status: 'encoding', message: 'Uruchamiam ffmpeg MP4 POC bez audio...', progress: 30, activeExportId: exportId });
      await ffmpeg.exec(plan.command);

      const outputData = await ffmpeg.readFile('fotobeat-output.mp4');
      const outputBlob = new Blob([outputData], { type: 'video/mp4' });
      const downloadUrl = URL.createObjectURL(outputBlob);
      const fileName = `${safeFilename(sequence.projectName)}-poc-${sequence.id}.mp4`;
      const exportItem = {
        id: exportId,
        createdAt: new Date().toISOString(),
        fileName,
        downloadUrl: '',
        mimeType: 'video/mp4',
        size: outputBlob.size,
        duration: sequence.seconds,
        fps: sequence.fps,
        width: sequence.width,
        height: sequence.height,
        sequenceId: sequence.id,
        hasAudio: false,
        blob: outputBlob,
        plan
      };

      await cleanupVirtualFrames({ ffmpeg, sequence });
      await saveMp4Export(exportItem);
      objectUrlsRef.current.add(downloadUrl);

      setMp4Exports((current) => [{ ...exportItem, downloadUrl }, ...current].slice(0, MAX_MP4_HISTORY));
      setMp4State({
        status: 'ready',
        message: `MP4 POC gotowy: ${fileName}.`,
        progress: 100,
        activeExportId: exportId
      });
    } catch (error) {
      setMp4State({
        status: 'error',
        message: error.message || 'Nie udało się wygenerować MP4 przez ffmpeg.wasm.',
        progress: 0,
        activeExportId: exportId
      });
    }
  }

  async function removeMp4Export(exportId) {
    setMp4Exports((current) => {
      const item = current.find((entry) => entry.id === exportId);
      if (item?.downloadUrl) {
        URL.revokeObjectURL(item.downloadUrl);
        objectUrlsRef.current.delete(item.downloadUrl);
      }
      return current.filter((entry) => entry.id !== exportId);
    });

    await deleteMp4Export(exportId);
  }

  async function clearMp4History() {
    mp4Exports.forEach((item) => {
      if (item.downloadUrl) {
        URL.revokeObjectURL(item.downloadUrl);
        objectUrlsRef.current.delete(item.downloadUrl);
      }
    });
    await clearMp4Exports();
    setMp4Exports([]);
    setMp4State({ status: 'idle', message: 'Historia MP4 wyczyszczona.', progress: 0, activeExportId: '' });
  }

  return {
    mp4State,
    mp4Exports,
    exportSequenceToMp4,
    removeMp4Export,
    clearMp4History
  };
}

async function getLoadedFfmpeg(onLoadProgress) {
  if (getLoadedFfmpeg.cache) return getLoadedFfmpeg.cache;

  const [{ FFmpeg }, { fetchFile }] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
    import('@ffmpeg/util')
  ]);
  const ffmpeg = new FFmpeg();

  ffmpeg.on('progress', ({ progress }) => {
    onLoadProgress?.(progress);
  });

  await ffmpeg.load();
  getLoadedFfmpeg.cache = { ffmpeg, fetchFile };
  return getLoadedFfmpeg.cache;
}

async function prepareVirtualFrames({ ffmpeg, fetchFile, sequence }) {
  try {
    await ffmpeg.createDir('frames');
  } catch {
    // Directory may already exist from a previous POC render.
  }

  for (let index = 0; index < sequence.frames.length; index += 1) {
    const frame = sequence.frames[index];
    const virtualPath = `frames/frame_${String(index + 1).padStart(4, '0')}.png`;
    await ffmpeg.writeFile(virtualPath, await fetchFile(frame.blob));
  }
}

async function cleanupVirtualFrames({ ffmpeg, sequence }) {
  await Promise.all(sequence.frames.map(async (_, index) => {
    const virtualPath = `frames/frame_${String(index + 1).padStart(4, '0')}.png`;
    try {
      await ffmpeg.deleteFile(virtualPath);
    } catch {
      // File cleanup is best-effort.
    }
  }));

  try {
    await ffmpeg.deleteFile('fotobeat-output.mp4');
  } catch {
    // Output cleanup is best-effort.
  }
}

getLoadedFfmpeg.cache = null;
