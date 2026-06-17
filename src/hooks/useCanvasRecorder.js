import { useEffect, useMemo, useRef, useState } from 'react';
import { safeFilename } from '../utils/projectExport.js';
import { clearRenderExports, deleteRenderExport, loadRenderExports, pruneRenderExports, saveRenderExport } from '../utils/renderStorage.js';

const DEFAULT_FPS = 30;
const MAX_RECORD_SECONDS = 30;
const MAX_HISTORY_ITEMS = 10;

export function useCanvasRecorder({ canvasRef, projectName, timelineDuration, audioFile }) {
  const objectUrlsRef = useRef(new Set());
  const [exportHistory, setExportHistory] = useState([]);
  const [recordingState, setRecordingState] = useState({
    status: 'idle',
    message: 'Gotowe do nagrania preview WebM.',
    downloadUrl: '',
    fileName: '',
    mimeType: pickMimeType(),
    duration: 0,
    hasAudio: false,
    activeExportId: ''
  });

  useEffect(() => {
    let cancelled = false;
    const objectUrls = objectUrlsRef.current;

    loadPersistentHistory()
      .then((items) => {
        if (cancelled) {
          items.forEach((item) => {
            if (item.downloadUrl) {
              URL.revokeObjectURL(item.downloadUrl);
            }
          });
          return;
        }

        items.forEach((item) => {
          if (item.downloadUrl) {
            objectUrls.add(item.downloadUrl);
          }
        });

        setExportHistory(items);
        if (items.length > 0) {
          setRecordingState((current) => ({
            ...current,
            message: `Wczytano ${items.length} zapisanych eksportów WebM z IndexedDB.`
          }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecordingState((current) => ({
            ...current,
            status: 'error',
            message: 'Nie udało się wczytać historii eksportów z IndexedDB.'
          }));
        }
      });

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  const maxDuration = useMemo(() => {
    return Number(Math.min(Math.max(timelineDuration || 4, 4), MAX_RECORD_SECONDS).toFixed(1));
  }, [timelineDuration]);

  async function startRecording() {
    const canvas = canvasRef.current;

    if (!canvas) {
      setRecordingState((current) => ({ ...current, status: 'error', message: 'Brak canvas do nagrania.' }));
      return;
    }

    if (!window.MediaRecorder || !canvas.captureStream) {
      setRecordingState((current) => ({
        ...current,
        status: 'error',
        message: 'Ta przeglądarka nie obsługuje MediaRecorder albo canvas.captureStream.'
      }));
      return;
    }

    const exportId = `export-${Date.now()}`;
    const mimeType = pickMimeType();
    const canvasStream = canvas.captureStream(DEFAULT_FPS);
    const chunks = [];
    let audioContext = null;
    let audioSource = null;
    let recordingStream = canvasStream;
    let recordingDuration = maxDuration;
    let hasAudio = false;

    setRecordingState({
      status: 'preparing',
      message: audioFile ? 'Przygotowuję canvas i ścieżkę audio do eksportu WebM...' : 'Przygotowuję canvas do eksportu WebM bez audio...',
      downloadUrl: '',
      fileName: '',
      mimeType,
      duration: recordingDuration,
      hasAudio: false,
      activeExportId: exportId
    });

    try {
      if (audioFile) {
        const preparedAudio = await prepareAudioTrack(audioFile);
        audioContext = preparedAudio.audioContext;
        audioSource = preparedAudio.audioSource;
        hasAudio = true;
        recordingDuration = Number(Math.min(maxDuration, preparedAudio.duration || maxDuration).toFixed(1));
        recordingStream = new window.MediaStream([
          ...canvasStream.getVideoTracks(),
          ...preparedAudio.audioStream.getAudioTracks()
        ]);
      }

      const recorder = new window.MediaRecorder(recordingStream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          chunks.push(event.data);
        }
      };

      recorder.onerror = () => {
        cleanupRecording({ recordingStream, canvasStream, audioSource, audioContext });
        setRecordingState({
          status: 'error',
          message: 'Nagrywanie WebM przerwane przez błąd MediaRecorder.',
          downloadUrl: '',
          fileName: '',
          mimeType,
          duration: 0,
          hasAudio,
          activeExportId: exportId
        });
      };

      recorder.onstop = async () => {
        cleanupRecording({ recordingStream, canvasStream, audioSource, audioContext });
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const downloadUrl = URL.createObjectURL(blob);
        const fileName = `${safeFilename(projectName)}-preview-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
        const exportItem = {
          id: exportId,
          createdAt: new Date().toISOString(),
          fileName,
          downloadUrl,
          mimeType: mimeType || 'video/webm',
          duration: recordingDuration,
          hasAudio,
          size: blob.size,
          status: 'ready',
          persisted: false
        };

        objectUrlsRef.current.add(downloadUrl);

        try {
          await saveRenderExport({ ...exportItem, downloadUrl: '', blob, persisted: true });
          await pruneRenderExports(MAX_HISTORY_ITEMS);
          exportItem.persisted = true;
        } catch {
          exportItem.persisted = false;
        }

        setExportHistory((current) => [exportItem, ...current].slice(0, MAX_HISTORY_ITEMS));
        setRecordingState({
          status: 'ready',
          message: `Gotowe: ${fileName}. ${hasAudio ? 'Eksport zawiera obraz i ścieżkę audio.' : 'Eksport zawiera tylko obraz, bo nie dodano audio.'} ${exportItem.persisted ? 'Zapisano w IndexedDB.' : 'Nie udało się zapisać w IndexedDB.'}`,
          downloadUrl,
          fileName,
          mimeType: mimeType || 'video/webm',
          duration: recordingDuration,
          hasAudio,
          activeExportId: exportId
        });
      };

      setRecordingState({
        status: 'recording',
        message: `Nagrywam ${hasAudio ? 'canvas + audio' : 'canvas'} przez ${recordingDuration}s...`,
        downloadUrl: '',
        fileName: '',
        mimeType,
        duration: recordingDuration,
        hasAudio,
        activeExportId: exportId
      });

      recorder.start(250);
      audioSource?.start(0);

      window.setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, recordingDuration * 1000);
    } catch (error) {
      cleanupRecording({ recordingStream, canvasStream, audioSource, audioContext });
      setRecordingState({
        status: 'error',
        message: error.message || 'Nie udało się przygotować eksportu WebM z audio.',
        downloadUrl: '',
        fileName: '',
        mimeType,
        duration: 0,
        hasAudio: false,
        activeExportId: exportId
      });
    }
  }

  async function removeExport(exportId) {
    setExportHistory((current) => {
      const item = current.find((entry) => entry.id === exportId);

      if (item?.downloadUrl) {
        URL.revokeObjectURL(item.downloadUrl);
        objectUrlsRef.current.delete(item.downloadUrl);
      }

      return current.filter((entry) => entry.id !== exportId);
    });

    try {
      await deleteRenderExport(exportId);
    } catch {
      setRecordingState((current) => ({
        ...current,
        status: 'error',
        message: 'Usunięto z UI, ale nie udało się usunąć eksportu z IndexedDB.'
      }));
    }
  }

  async function clearExportHistory() {
    exportHistory.forEach((item) => {
      if (item.downloadUrl) {
        URL.revokeObjectURL(item.downloadUrl);
        objectUrlsRef.current.delete(item.downloadUrl);
      }
    });

    setExportHistory([]);

    try {
      await clearRenderExports();
      setRecordingState((current) => ({
        ...current,
        downloadUrl: '',
        fileName: '',
        activeExportId: '',
        message: 'Historia eksportów wyczyszczona z UI i IndexedDB.'
      }));
    } catch {
      setRecordingState((current) => ({
        ...current,
        status: 'error',
        message: 'Historia wyczyszczona z UI, ale IndexedDB zwróciło błąd.'
      }));
    }
  }

  return {
    recordingState,
    exportHistory,
    startRecording,
    removeExport,
    clearExportHistory,
    maxDuration
  };
}

async function loadPersistentHistory() {
  const storedItems = await loadRenderExports(MAX_HISTORY_ITEMS);

  return storedItems.map((item) => {
    const downloadUrl = URL.createObjectURL(item.blob);

    return {
      ...item,
      downloadUrl,
      persisted: true
    };
  });
}

async function prepareAudioTrack(audioFile) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error('Ta przeglądarka nie obsługuje Web Audio API wymaganego do eksportu audio.');
  }

  const audioContext = new AudioContextClass();
  await audioContext.resume?.();

  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const audioSource = audioContext.createBufferSource();
  const destination = audioContext.createMediaStreamDestination();

  audioSource.buffer = audioBuffer;
  audioSource.connect(destination);

  return {
    audioContext,
    audioSource,
    audioStream: destination.stream,
    duration: audioBuffer.duration
  };
}

function pickMimeType() {
  if (!window.MediaRecorder) return '';

  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  return candidates.find((type) => window.MediaRecorder.isTypeSupported(type)) ?? '';
}

function cleanupRecording({ recordingStream, canvasStream, audioSource, audioContext }) {
  try {
    audioSource?.stop();
  } catch {
    // Audio source may already be stopped by MediaRecorder timing.
  }

  stopStream(recordingStream);

  if (recordingStream !== canvasStream) {
    stopStream(canvasStream);
  }

  audioContext?.close?.();
}

function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}
