import { useEffect, useRef, useState } from 'react';
import { drawRenderPreview, findClipAtTime } from '../utils/canvasRenderer.js';
import { resolveMediaForClip } from '../utils/mediaScoring.js';

export function useCanvasPreview({ timeline, selectedFormat, selectedPreset, selectedMediaAssets, pinnedAssetsByClip, projectName }) {
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
      const clip = findClipAtTime(timeline.clips, time);
      const clipIndex = Math.max(1, timeline.clips.indexOf(clip) + 1);
      const mediaAsset = resolveMediaForClip(clipIndex, selectedMediaAssets, pinnedAssetsByClip);

      drawRenderPreview(canvas, {
        time,
        clip,
        clipIndex,
        totalClips: timeline.clips.length,
        format: selectedFormat,
        preset: selectedPreset,
        imageCount: selectedMediaAssets.length,
        mediaAsset,
        projectName
      });

      if (now - lastHudUpdate > 220) {
        setPreviewPlayback({ time: Number(time.toFixed(1)), clipIndex });
        lastHudUpdate = now;
      }

      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [pinnedAssetsByClip, projectName, selectedFormat, selectedMediaAssets, selectedPreset, timeline]);

  return {
    previewRef,
    previewPlayback
  };
}
