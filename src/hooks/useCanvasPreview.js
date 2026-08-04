import { useEffect, useRef, useState } from 'react';
import { renderFrameAtTime } from '../utils/canvasRenderer.js';

export function useCanvasPreview({ timeline, selectedFormat, selectedPreset, selectedRenderVariant, selectedMediaAssets, pinnedAssetsByClip, projectName }) {
  const previewRef = useRef(null);
  const [previewPlayback, setPreviewPlayback] = useState({ time: 0, clipIndex: 1 });

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return undefined;

    let frameId;
    let lastHudUpdate = 0;
    const startedAt = performance.now();

    function frame(now) {
      const totalDuration = Math.max(timeline.estimatedDuration || 1, 1);
      const time = ((now - startedAt) / 1000) % totalDuration;
      const frameMeta = renderFrameAtTime(canvas, {
        time,
        timeline,
        selectedFormat,
        selectedPreset,
        selectedRenderVariant,
        selectedMediaAssets,
        pinnedAssetsByClip,
        projectName
      });

      if (now - lastHudUpdate > 220) {
        setPreviewPlayback({ time: Number(frameMeta.time.toFixed(1)), clipIndex: frameMeta.clipIndex });
        lastHudUpdate = now;
      }

      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [pinnedAssetsByClip, projectName, selectedFormat, selectedMediaAssets, selectedPreset, selectedRenderVariant, timeline]);

  return {
    previewRef,
    previewPlayback
  };
}
