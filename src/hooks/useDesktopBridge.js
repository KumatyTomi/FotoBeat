import { useEffect, useMemo, useState } from 'react';
import {
  createDesktopAudioFilePayload,
  getSelectedDesktopAudioFile,
  validateDesktopAudioPayload
} from '../utils/desktopAudioPayload.js';
import { getResolvedMp4Profile } from '../utils/mp4ProfileSelection.js';

const INITIAL_STATUS = {
  type: 'idle',
  message: 'Tryb desktop niewykryty. Uruchom aplikację przez Electron.'
};

const TERMINAL_RENDER_STATUSES = ['done', 'failed', 'canceled'];

const DESKTOP_SEQUENCE_LIMITS = {
  maxFramesPerChunk: 24,
  maxChunkBytes: 32 * 1024 * 1024,
  maxSingleFrameBytes: 32 * 1024 * 1024,
  maxTotalBytes: 512 * 1024 * 1024
};

function getDesktopApi() {
  if (typeof window === 'undefined') return null;
  return window.fotobeatDesktop ?? null;
}

export function useDesktopBridge() {
  const [version, setVersion] = useState(null);
  const [ffmpegStatus, setFfmpegStatus] = useState(null);
  const [outputFolder, setOutputFolder] = useState(null);
  const [localRenderJob, setLocalRenderJob] = useState(null);
  const [renderHistory, setRenderHistory] = useState([]);
  const [status, setStatus] = useState(INITIAL_STATUS);

  const available = useMemo(() => Boolean(getDesktopApi()), []);
  const ffmpegReady = Boolean(ffmpegStatus?.available);

  useEffect(() => {
    const api = getDesktopApi();

    if (!api) {
      setStatus(INITIAL_STATUS);
      return;
    }

    let active = true;

    Promise.all([
      api.getVersion(),
      typeof api.getFfmpegStatus === 'function' ? api.getFfmpegStatus() : Promise.resolve(null),
      typeof api.listRenderHistory === 'function' ? api.listRenderHistory(12) : Promise.resolve([])
    ])
      .then(([info, ffmpeg, history]) => {
        if (!active) return;
        setVersion(info);
        setFfmpegStatus(ffmpeg);
        setRenderHistory(Array.isArray(history) ? history : []);
        setStatus({
          type: ffmpeg?.available ? 'success' : 'warning',
          message: ffmpeg?.available
            ? `Desktop ready · FFmpeg ${ffmpeg.version ?? 'available'}`
            : 'Desktop bridge gotowy, ale FFmpeg nie jest jeszcze wykryty.'
        });
      })
      .catch((error) => {
        if (!active) return;
        setStatus({ type: 'error', message: error.message || 'Nie udało się odczytać desktop bridge.' });
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const api = getDesktopApi();

    if (!api || !localRenderJob || TERMINAL_RENDER_STATUSES.includes(localRenderJob.status)) {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      try {
        const nextJob = await api.getLocalRenderJob(localRenderJob.id);
        if (!nextJob) return;
        setLocalRenderJob(nextJob);
        setStatus({
          type: nextJob.status === 'done' ? 'success' : nextJob.status === 'failed' ? 'error' : nextJob.status === 'canceled' ? 'warning' : 'info',
          message: describeDesktopJob(nextJob)
        });

        if (TERMINAL_RENDER_STATUSES.includes(nextJob.status)) {
          await refreshRenderHistory();
        }
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Błąd pollingu desktop render job.' });
      }
    }, 1400);

    return () => window.clearInterval(interval);
  }, [localRenderJob]);

  async function refreshFfmpegStatus() {
    const api = getDesktopApi();
    if (!api || typeof api.getFfmpegStatus !== 'function') {
      setStatus({ type: 'error', message: 'FFmpeg doctor nie jest dostępny w preload bridge.' });
      return null;
    }

    setStatus({ type: 'info', message: 'Sprawdzam lokalny FFmpeg...' });
    const nextStatus = await api.getFfmpegStatus();
    setFfmpegStatus(nextStatus);
    setStatus({
      type: nextStatus.available ? 'success' : 'warning',
      message: nextStatus.available
        ? `FFmpeg gotowy: ${nextStatus.version ?? nextStatus.binary}`
        : 'FFmpeg nie jest dostępny lokalnie.'
    });
    return nextStatus;
  }

  async function refreshRenderHistory(limit = 12) {
    const api = getDesktopApi();
    if (!api || typeof api.listRenderHistory !== 'function') {
      return [];
    }

    const history = await api.listRenderHistory(limit);
    const safeHistory = Array.isArray(history) ? history : [];
    setRenderHistory(safeHistory);
    return safeHistory;
  }

  async function clearRenderHistory() {
    const api = getDesktopApi();
    if (!api || typeof api.clearRenderHistory !== 'function') {
      setStatus({ type: 'error', message: 'Historia renderów nie jest dostępna w preload bridge.' });
      return [];
    }

    const history = await api.clearRenderHistory();
    setRenderHistory(Array.isArray(history) ? history : []);
    setStatus({ type: 'success', message: 'Historia renderów desktop została wyczyszczona.' });
    return history;
  }

  async function showItemInFolder(targetPath) {
    const api = getDesktopApi();
    if (!api || typeof api.showItemInFolder !== 'function') {
      setStatus({ type: 'error', message: 'Akcja Pokaż w folderze nie jest dostępna w preload bridge.' });
      return null;
    }

    if (!targetPath) {
      setStatus({ type: 'error', message: 'Brak ścieżki do pokazania w folderze.' });
      return null;
    }

    const result = await api.showItemInFolder(targetPath);
    setStatus({ type: 'success', message: `Pokazuję w folderze: ${targetPath}` });
    return result;
  }

  async function openPath(targetPath) {
    const api = getDesktopApi();
    if (!api || typeof api.openPath !== 'function') {
      setStatus({ type: 'error', message: 'Akcja otwierania ścieżki nie jest dostępna w preload bridge.' });
      return null;
    }

    if (!targetPath) {
      setStatus({ type: 'error', message: 'Brak ścieżki do otwarcia.' });
      return null;
    }

    const result = await api.openPath(targetPath);
    setStatus({ type: 'success', message: `Otwieram: ${targetPath}` });
    return result;
  }

  async function cancelLocalRenderJob(jobId = localRenderJob?.id) {
    const api = getDesktopApi();
    if (!api || typeof api.cancelLocalRenderJob !== 'function') {
      setStatus({ type: 'error', message: 'Cancel desktop render nie jest dostępny w preload bridge.' });
      return null;
    }

    if (!jobId) {
      setStatus({ type: 'error', message: 'Brak desktop jobId do przerwania.' });
      return null;
    }

    const job = await api.cancelLocalRenderJob(jobId);
    if (job) setLocalRenderJob(job);
    setStatus({ type: 'warning', message: `Przerwano desktop render: ${jobId}` });
    await refreshRenderHistory();
    return job;
  }

  async function retryLocalRenderJob(jobId = localRenderJob?.id) {
    const api = getDesktopApi();
    if (!api || typeof api.retryLocalRenderJob !== 'function') {
      setStatus({ type: 'error', message: 'Retry desktop render nie jest dostępny w preload bridge.' });
      return null;
    }

    if (!jobId) {
      setStatus({ type: 'error', message: 'Brak desktop jobId do ponowienia.' });
      return null;
    }

    const job = await api.retryLocalRenderJob(jobId);
    if (job) setLocalRenderJob(job);
    setStatus({ type: 'info', message: `Ponawiam desktop render: ${jobId}` });
    await refreshRenderHistory();
    return job;
  }

  async function pickOutputFolder() {
    const api = getDesktopApi();
    if (!api) {
      setStatus(INITIAL_STATUS);
      return null;
    }

    const folder = await api.pickOutputFolder();
    if (folder) {
      setOutputFolder(folder);
      setStatus({ type: 'success', message: `Folder eksportu: ${folder}` });
    }
    return folder;
  }

  async function createLocalRenderJob(payload) {
    const api = getDesktopApi();
    if (!api) {
      setStatus(INITIAL_STATUS);
      return null;
    }

    setStatus({ type: 'info', message: 'Tworzę lokalny desktop render job...' });
    const payloadWithRenderProfile = attachMp4RenderProfile(payload);
    const job = await api.createLocalRenderJob({
      ...payloadWithRenderProfile,
      outputFolder
    });
    setLocalRenderJob(job);
    setStatus({ type: 'info', message: describeDesktopJob(job) });
    await refreshRenderHistory();
    return job;
  }

  async function createLocalRenderJobFromSequence(payload, sequence, audioFile = undefined) {
    if (!sequence?.frames?.length) {
      return createLocalRenderJob(payload);
    }

    const api = getDesktopApi();
    if (!api) {
      setStatus(INITIAL_STATUS);
      return null;
    }

    const selectedAudioFile = audioFile === undefined ? getSelectedDesktopAudioFile() : audioFile;

    const frameCheck = validateSequencePayload(sequence);
    if (!frameCheck.ok) {
      setStatus({ type: 'error', message: frameCheck.message });
      return null;
    }

    const audioCheck = validateDesktopAudioPayload(selectedAudioFile);
    if (!audioCheck.ok) {
      setStatus({ type: 'error', message: audioCheck.message });
      return null;
    }

    let audioFilePayload = null;
    try {
      audioFilePayload = await createDesktopAudioFilePayload(selectedAudioFile);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Nie udało się przygotować audio do desktop renderu.' });
      return null;
    }

    if (typeof api.appendLocalRenderJobFrames !== 'function') {
      setStatus({ type: 'info', message: `Przygotowuję ${sequence.frames.length} klatek PNG${selectedAudioFile ? ' i audio' : ''} do desktop workspace...` });
      const frames = await Promise.all(sequence.frames.map(createFramePayload));
      return createLocalRenderJob({
        ...payload,
        frames,
        audioFile: audioFilePayload
      });
    }

    const chunks = chunkSequenceFrames(sequence.frames);
    setStatus({
      type: 'info',
      message: `Tworzę desktop job i wyślę ${sequence.frames.length} klatek PNG w ${chunks.length} paczkach.`
    });

    const job = await createLocalRenderJob({
      ...payload,
      audioFile: audioFilePayload,
      deferStart: true
    });

    if (!job?.id) return job;

    let currentJob = job;
    let importedFrames = 0;

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];
      const complete = index === chunks.length - 1;
      const frames = await Promise.all(chunk.map(createFramePayload));
      importedFrames += frames.length;
      setStatus({
        type: 'info',
        message: `Wysyłam klatki do desktop workspace: ${importedFrames}/${sequence.frames.length}`
      });
      currentJob = await api.appendLocalRenderJobFrames(job.id, frames, { complete });
      setLocalRenderJob(currentJob);
    }

    setStatus({ type: 'info', message: describeDesktopJob(currentJob) });
    await refreshRenderHistory();
    return currentJob;
  }

  function clearLocalRenderJob() {
    setLocalRenderJob(null);
    setStatus(available
      ? { type: ffmpegReady ? 'success' : 'warning', message: ffmpegReady ? 'Desktop bridge i FFmpeg gotowe.' : 'Desktop bridge gotowy, FFmpeg niewykryty.' }
      : INITIAL_STATUS);
  }

  return {
    available,
    version,
    ffmpegStatus,
    ffmpegReady,
    outputFolder,
    localRenderJob,
    renderHistory,
    status,
    refreshFfmpegStatus,
    refreshRenderHistory,
    clearRenderHistory,
    showItemInFolder,
    openPath,
    cancelLocalRenderJob,
    retryLocalRenderJob,
    pickOutputFolder,
    createLocalRenderJob,
    createLocalRenderJobFromSequence,
    clearLocalRenderJob
  };
}

function describeDesktopJob(job) {
  const mode = job.mode ?? 'unknown-mode';
  const base = `Desktop render: ${job.status} · ${job.progress}% · ${mode}`;

  if (job.status === 'canceled') {
    return `${base} · canceled by user`;
  }

  if (job.hasNativeResult || job.nativeResultSummary) {
    const size = job.nativeResultSummary?.output?.sizeBytes
      ? ` · ${formatBytes(job.nativeResultSummary.output.sizeBytes)}`
      : '';
    return `${base} · native FFmpeg complete${size}`;
  }

  if (mode === 'native-ffmpeg') {
    return `${base} · native FFmpeg encoding`;
  }

  if (job.nativeReady) {
    return `${base} · frames detected`;
  }

  if (mode === 'placeholder') {
    return `${base} · missing frames for native FFmpeg`;
  }

  return base;
}

function attachMp4RenderProfile(payload = {}) {
  if (!payload?.manifest || payload.manifest.renderProfile) return payload;

  const sequenceOrFormat = payload.manifest.sequence ?? payload.manifest.format ?? null;
  return {
    ...payload,
    manifest: {
      ...payload.manifest,
      renderProfile: getResolvedMp4Profile({
        profileId: 'auto',
        sequence: sequenceOrFormat,
        includeAudio: Boolean(payload.manifest.audio),
        preferStored: true
      })
    }
  };
}

function validateSequencePayload(sequence) {
  const totalSize = sequence.frames.reduce((sum, frame) => sum + (Number(frame.size) || 0), 0);
  if (totalSize > DESKTOP_SEQUENCE_LIMITS.maxTotalBytes) {
    return {
      ok: false,
      message: `Sekwencja PNG ma ${formatBytes(totalSize)}. Limit desktop importu to ${formatBytes(DESKTOP_SEQUENCE_LIMITS.maxTotalBytes)}.`
    };
  }

  const oversizedFrame = sequence.frames.find((frame) => (Number(frame.size) || 0) > DESKTOP_SEQUENCE_LIMITS.maxSingleFrameBytes);
  if (oversizedFrame) {
    return {
      ok: false,
      message: `Klatka ${oversizedFrame.index ?? '?'} ma ${formatBytes(oversizedFrame.size)}. Limit jednej paczki IPC to ${formatBytes(DESKTOP_SEQUENCE_LIMITS.maxSingleFrameBytes)}.`
    };
  }

  const missingBlob = sequence.frames.find((frame) => !frame.blob || typeof frame.blob.arrayBuffer !== 'function');
  if (missingBlob) {
    return {
      ok: false,
      message: `Klatka ${missingBlob.index ?? '?'} nie ma poprawnego PNG Blob.`
    };
  }

  return { ok: true, totalSize };
}

function chunkSequenceFrames(frames) {
  const chunks = [];
  let currentChunk = [];
  let currentBytes = 0;

  frames.forEach((frame) => {
    const frameSize = Number(frame.size) || 0;
    const wouldOverflowFrames = currentChunk.length >= DESKTOP_SEQUENCE_LIMITS.maxFramesPerChunk;
    const wouldOverflowBytes = currentChunk.length > 0 && currentBytes + frameSize > DESKTOP_SEQUENCE_LIMITS.maxChunkBytes;

    if (wouldOverflowFrames || wouldOverflowBytes) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentBytes = 0;
    }

    currentChunk.push(frame);
    currentBytes += frameSize;
  });

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function createFramePayload(frame) {
  return {
    index: frame.index,
    fileName: frame.fileName,
    size: frame.size,
    arrayBuffer: await frame.blob.arrayBuffer()
  };
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
