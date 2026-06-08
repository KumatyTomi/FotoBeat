import { useEffect, useMemo, useState } from 'react';
import { safeFilename } from '../utils/projectExport.js';

const DEFAULT_FPS = 30;
const MAX_RECORD_SECONDS = 30;

export function useCanvasRecorder({ canvasRef, projectName, timelineDuration }) {
  const [recordingState, setRecordingState] = useState({
    status: 'idle',
    message: 'Gotowe do nagrania preview WebM.',
    downloadUrl: '',
    fileName: '',
    mimeType: pickMimeType(),
    duration: 0
  });

  useEffect(() => {
    return () => {
      if (recordingState.downloadUrl) {
        URL.revokeObjectURL(recordingState.downloadUrl);
      }
    };
  }, [recordingState.downloadUrl]);

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

    const mimeType = pickMimeType();
    const stream = canvas.captureStream(DEFAULT_FPS);
    const chunks = [];
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    if (recordingState.downloadUrl) {
      URL.revokeObjectURL(recordingState.downloadUrl);
    }

    recorder.ondataavailable = (event) => {
      if (event.data?.size) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = () => {
      stopStream(stream);
      setRecordingState({
        status: 'error',
        message: 'Nagrywanie WebM przerwane przez błąd MediaRecorder.',
        downloadUrl: '',
        fileName: '',
        mimeType,
        duration: 0
      });
    };

    recorder.onstop = () => {
      stopStream(stream);
      const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = `${safeFilename(projectName)}-preview.webm`;

      setRecordingState({
        status: 'ready',
        message: `Gotowe: ${fileName}. To eksport preview bez ścieżki audio.`,
        downloadUrl,
        fileName,
        mimeType: mimeType || 'video/webm',
        duration: maxDuration
      });
    };

    setRecordingState({
      status: 'recording',
      message: `Nagrywam canvas preview przez ${maxDuration}s...`,
      downloadUrl: '',
      fileName: '',
      mimeType,
      duration: maxDuration
    });

    recorder.start(250);
    window.setTimeout(() => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    }, maxDuration * 1000);
  }

  return {
    recordingState,
    startRecording,
    maxDuration
  };
}

function pickMimeType() {
  if (!window.MediaRecorder) return '';

  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  return candidates.find((type) => window.MediaRecorder.isTypeSupported(type)) ?? '';
}

function stopStream(stream) {
  stream.getTracks().forEach((track) => track.stop());
}
