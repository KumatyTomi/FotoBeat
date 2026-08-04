import { useState } from 'react';
import { renderFrameAtTime } from '../utils/canvasRenderer.js';
import { buildCoverFrameFileName, describeCoverFrame, pickCoverFrameTime } from '../utils/coverFrame.js';
import { safeFilename } from '../utils/projectExport.js';

const EMPTY_FRAME_EXPORT = {
  status: 'idle',
  message: 'Gotowe do eksportu testowej klatki PNG.',
  downloadHref: '',
  fileName: '',
  frameMeta: null
};

const EMPTY_COVER_EXPORT = {
  status: 'idle',
  message: 'Cover PNG nie został jeszcze wygenerowany.',
  downloadHref: '',
  fileName: '',
  frameMeta: null,
  strategyId: 'smart'
};

export function useFrameExporter({
  canvasRef,
  projectName,
  timeline,
  selectedFormat,
  selectedPreset,
  selectedMediaAssets,
  pinnedAssetsByClip
}) {
  const [frameExport, setFrameExport] = useState(EMPTY_FRAME_EXPORT);
  const [coverExport, setCoverExport] = useState(EMPTY_COVER_EXPORT);

  function exportFrameAtTime(time) {
    const result = buildFrameExport(time, (frameMeta) => `${safeFilename(projectName)}-frame-${String(frameMeta.time).replace('.', '-')}.png`);

    if (!result) return;
    if (result.status === 'error') {
      setFrameExport(result);
      return;
    }

    setFrameExport({
      status: 'ready',
      message: `Klatka PNG gotowa: ${result.fileName}.`,
      ...result
    });
  }

  function generateCoverFrame(currentTime, strategyId = 'smart') {
    const time = pickCoverFrameTime({ timeline, currentTime, strategyId });
    const result = buildFrameExport(time, (frameMeta) => buildCoverFrameFileName({
      projectName,
      formatId: selectedFormat?.id,
      time: frameMeta.time
    }));

    if (!result) return;
    if (result.status === 'error') {
      setCoverExport({
        ...EMPTY_COVER_EXPORT,
        status: 'error',
        message: result.message
      });
      return;
    }

    setCoverExport({
      status: 'ready',
      message: describeCoverFrame({ frameMeta: result.frameMeta, strategyId }),
      ...result,
      strategyId
    });
  }

  function buildFrameExport(time, buildFileName) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        status: 'error',
        message: 'Brak canvas do eksportu klatki.',
        downloadHref: '',
        fileName: '',
        frameMeta: null
      };
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
    const fileName = buildFileName(frameMeta);

    return {
      downloadHref: canvas.toDataURL('image/png'),
      fileName,
      frameMeta
    };
  }

  function clearFrameExport() {
    setFrameExport(EMPTY_FRAME_EXPORT);
  }

  function clearCoverExport() {
    setCoverExport(EMPTY_COVER_EXPORT);
  }

  return {
    frameExport,
    coverExport,
    exportFrameAtTime,
    generateCoverFrame,
    clearFrameExport,
    clearCoverExport
  };
}
