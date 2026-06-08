import { useState } from 'react';
import { renderFrameAtTime } from '../utils/canvasRenderer.js';
import { safeFilename } from '../utils/projectExport.js';

export function useFrameExporter({
  canvasRef,
  projectName,
  timeline,
  selectedFormat,
  selectedPreset,
  selectedMediaAssets,
  pinnedAssetsByClip
}) {
  const [frameExport, setFrameExport] = useState({
    status: 'idle',
    message: 'Gotowe do eksportu testowej klatki PNG.',
    downloadHref: '',
    fileName: '',
    frameMeta: null
  });

  function exportFrameAtTime(time) {
    const canvas = canvasRef.current;

    if (!canvas) {
      setFrameExport({
        status: 'error',
        message: 'Brak canvas do eksportu klatki.',
        downloadHref: '',
        fileName: '',
        frameMeta: null
      });
      return;
    }

    const frameMeta = renderFrameAtTime(canvas, {
      time,
      timeline,
      selectedFormat,
      selectedPreset,
      selectedMediaAssets,
      pinnedAssetsByClip,
      projectName
    });

    const downloadHref = canvas.toDataURL('image/png');
    const fileName = `${safeFilename(projectName)}-frame-${String(frameMeta.time).replace('.', '-')}.png`;

    setFrameExport({
      status: 'ready',
      message: `Klatka PNG gotowa: ${fileName}.`,
      downloadHref,
      fileName,
      frameMeta
    });
  }

  function clearFrameExport() {
    setFrameExport({
      status: 'idle',
      message: 'Gotowe do eksportu testowej klatki PNG.',
      downloadHref: '',
      fileName: '',
      frameMeta: null
    });
  }

  return {
    frameExport,
    exportFrameAtTime,
    clearFrameExport
  };
}
