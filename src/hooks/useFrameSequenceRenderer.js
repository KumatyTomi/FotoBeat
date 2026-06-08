import { useEffect, useRef, useState } from 'react';
import { renderFrameAtTime } from '../utils/canvasRenderer.js';
import { clearFrameSequences, deleteFrameSequence, loadFrameSequences, pruneFrameSequences, saveFrameSequence } from '../utils/frameSequenceStorage.js';
import { safeFilename } from '../utils/projectExport.js';

const MAX_SEQUENCE_SECONDS = 5;
const MAX_SEQUENCE_FPS = 12;
const MAX_SEQUENCE_HISTORY = 6;

export function useFrameSequenceRenderer({
  canvasRef,
  projectName,
  timeline,
  selectedFormat,
  selectedPreset,
  selectedMediaAssets,
  pinnedAssetsByClip
}) {
  const cancelRef = useRef(false);
  const [sequenceState, setSequenceState] = useState({
    status: 'idle',
    message: 'Gotowe do renderu testowej sekwencji PNG.',
    progress: 0,
    activeSequenceId: ''
  });
  const [sequenceHistory, setSequenceHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;

    loadFrameSequences(MAX_SEQUENCE_HISTORY)
      .then((sequences) => {
        if (!cancelled) {
          setSequenceHistory(sequences);
          if (sequences.length > 0) {
            setSequenceState((current) => ({
              ...current,
              message: `Wczytano ${sequences.length} zapisanych sekwencji klatek PNG.`
            }));
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSequenceState({
            status: 'error',
            message: 'Nie udało się wczytać sekwencji klatek z IndexedDB.',
            progress: 0,
            activeSequenceId: ''
          });
        }
      });

    return () => {
      cancelled = true;
      cancelRef.current = true;
    };
  }, []);

  async function renderSequence({ seconds = MAX_SEQUENCE_SECONDS, fps = MAX_SEQUENCE_FPS } = {}) {
    const canvas = canvasRef.current;

    if (!canvas) {
      setSequenceState({ status: 'error', message: 'Brak canvas do renderu sekwencji.', progress: 0, activeSequenceId: '' });
      return;
    }

    const safeSeconds = Math.min(Math.max(Number(seconds) || MAX_SEQUENCE_SECONDS, 1), MAX_SEQUENCE_SECONDS);
    const safeFps = Math.min(Math.max(Number(fps) || MAX_SEQUENCE_FPS, 1), MAX_SEQUENCE_FPS);
    const frameCount = Math.max(1, Math.ceil(safeSeconds * safeFps));
    const sequenceId = `sequence-${Date.now()}`;
    const frames = [];
    let totalSize = 0;

    cancelRef.current = false;
    setSequenceState({
      status: 'rendering',
      message: `Renderuję ${frameCount} klatek PNG (${safeSeconds}s @ ${safeFps} fps)...`,
      progress: 0,
      activeSequenceId: sequenceId
    });

    try {
      for (let index = 0; index < frameCount; index += 1) {
        if (cancelRef.current) {
          setSequenceState({ status: 'cancelled', message: 'Render sekwencji klatek został przerwany.', progress: 0, activeSequenceId: '' });
          return;
        }

        const time = Number((index / safeFps).toFixed(3));
        const frameMeta = renderFrameAtTime(canvas, {
          time,
          timeline,
          selectedFormat,
          selectedPreset,
          selectedMediaAssets,
          pinnedAssetsByClip,
          projectName
        });
        const blob = await canvasToPngBlob(canvas);
        totalSize += blob.size;
        frames.push({
          index,
          time: frameMeta.time,
          clipIndex: frameMeta.clipIndex,
          mediaAssetName: frameMeta.mediaAssetName,
          fileName: `${safeFilename(projectName)}-frame-${String(index + 1).padStart(4, '0')}.png`,
          size: blob.size,
          blob
        });

        setSequenceState({
          status: 'rendering',
          message: `Renderuję klatki PNG: ${index + 1}/${frameCount}`,
          progress: Math.round(((index + 1) / frameCount) * 100),
          activeSequenceId: sequenceId
        });

        await waitForUi();
      }

      const sequence = {
        id: sequenceId,
        createdAt: new Date().toISOString(),
        projectName,
        format: selectedFormat.id,
        width: selectedFormat.width,
        height: selectedFormat.height,
        fps: safeFps,
        seconds: safeSeconds,
        frameCount,
        totalSize,
        status: 'ready',
        frames
      };

      await saveFrameSequence(sequence);
      await pruneFrameSequences(MAX_SEQUENCE_HISTORY);
      setSequenceHistory((current) => [sequence, ...current].slice(0, MAX_SEQUENCE_HISTORY));
      setSequenceState({
        status: 'ready',
        message: `Sekwencja gotowa: ${frameCount} klatek PNG zapisanych w IndexedDB.`,
        progress: 100,
        activeSequenceId: sequenceId
      });
    } catch (error) {
      setSequenceState({
        status: 'error',
        message: error.message || 'Nie udało się wyrenderować sekwencji klatek.',
        progress: 0,
        activeSequenceId: sequenceId
      });
    }
  }

  function cancelSequenceRender() {
    cancelRef.current = true;
  }

  async function removeSequence(sequenceId) {
    await deleteFrameSequence(sequenceId);
    setSequenceHistory((current) => current.filter((sequence) => sequence.id !== sequenceId));
  }

  async function clearSequences() {
    await clearFrameSequences();
    setSequenceHistory([]);
    setSequenceState({ status: 'idle', message: 'Sekwencje klatek zostały wyczyszczone.', progress: 0, activeSequenceId: '' });
  }

  return {
    sequenceState,
    sequenceHistory,
    renderSequence,
    cancelSequenceRender,
    removeSequence,
    clearSequences,
    limits: {
      maxSeconds: MAX_SEQUENCE_SECONDS,
      maxFps: MAX_SEQUENCE_FPS
    }
  };
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Nie udało się utworzyć PNG blob z canvas.'));
    }, 'image/png');
  });
}

function waitForUi() {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}
