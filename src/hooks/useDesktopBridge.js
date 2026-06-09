import { useEffect, useMemo, useState } from 'react';

const INITIAL_STATUS = {
  type: 'idle',
  message: 'Tryb desktop niewykryty. Uruchom aplikację przez Electron.'
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
      typeof api.getFfmpegStatus === 'function' ? api.getFfmpegStatus() : Promise.resolve(null)
    ])
      .then(([info, ffmpeg]) => {
        if (!active) return;
        setVersion(info);
        setFfmpegStatus(ffmpeg);
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

    if (!api || !localRenderJob || ['done', 'failed'].includes(localRenderJob.status)) {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      try {
        const nextJob = await api.getLocalRenderJob(localRenderJob.id);
        if (!nextJob) return;
        setLocalRenderJob(nextJob);
        setStatus({ type: nextJob.status === 'done' ? 'success' : 'info', message: `Desktop render: ${nextJob.status} · ${nextJob.progress}%` });
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
    const job = await api.createLocalRenderJob({
      ...payload,
      outputFolder
    });
    setLocalRenderJob(job);
    setStatus({ type: 'info', message: `Desktop render: ${job.status} · ${job.progress}%` });
    return job;
  }

  async function createLocalRenderJobFromSequence(payload, sequence) {
    if (!sequence?.frames?.length) {
      return createLocalRenderJob(payload);
    }

    setStatus({ type: 'info', message: `Przygotowuję ${sequence.frames.length} klatek PNG do desktop workspace...` });
    const frames = await Promise.all(sequence.frames.map(async (frame) => ({
      index: frame.index,
      fileName: frame.fileName,
      size: frame.size,
      arrayBuffer: await frame.blob.arrayBuffer()
    })));

    return createLocalRenderJob({
      ...payload,
      frames
    });
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
    status,
    refreshFfmpegStatus,
    pickOutputFolder,
    createLocalRenderJob,
    createLocalRenderJobFromSequence,
    clearLocalRenderJob
  };
}
