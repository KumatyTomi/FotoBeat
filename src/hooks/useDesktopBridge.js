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
  const [outputFolder, setOutputFolder] = useState(null);
  const [localRenderJob, setLocalRenderJob] = useState(null);
  const [status, setStatus] = useState(INITIAL_STATUS);

  const available = useMemo(() => Boolean(getDesktopApi()), []);

  useEffect(() => {
    const api = getDesktopApi();

    if (!api) {
      setStatus(INITIAL_STATUS);
      return;
    }

    let active = true;
    api.getVersion()
      .then((info) => {
        if (!active) return;
        setVersion(info);
        setStatus({ type: 'success', message: `Desktop ready · Electron ${info.electronVersion}` });
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

  function clearLocalRenderJob() {
    setLocalRenderJob(null);
    setStatus(available
      ? { type: 'success', message: 'Desktop bridge gotowy.' }
      : INITIAL_STATUS);
  }

  return {
    available,
    version,
    outputFolder,
    localRenderJob,
    status,
    pickOutputFolder,
    createLocalRenderJob,
    clearLocalRenderJob
  };
}
