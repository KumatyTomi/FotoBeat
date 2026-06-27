import { useEffect, useRef } from 'react';
import { useGuiStore } from '../../stores/guiStore.js';

export default function VeilLayer({ activeProfile = 'creator' }) {
  const veilLayer = useGuiStore((state) => state.veilLayer);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = veilLayer.speed;
  }, [veilLayer.speed, veilLayer.sourceUrl]);

  if (!veilLayer.enabled) return null;

  const layerStyle = {
    '--veil-opacity': veilLayer.opacity,
    '--veil-blur': `${veilLayer.blur}px`,
    '--veil-saturation': veilLayer.saturation,
    '--veil-reactivity': veilLayer.reactivity
  };

  return (
    <div className={`veil-layer veil-layer-${activeProfile}`} style={layerStyle} aria-hidden="true">
      {veilLayer.sourceUrl && veilLayer.sourceType === 'video' ? (
        <video
          ref={videoRef}
          className="veil-layer-media"
          src={veilLayer.sourceUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      ) : null}

      {veilLayer.sourceUrl && veilLayer.sourceType === 'image' ? (
        <img className="veil-layer-media" src={veilLayer.sourceUrl} alt="" loading="lazy" />
      ) : null}

      {!veilLayer.sourceUrl ? <div className="veil-layer-fallback" /> : null}
      <div className="veil-layer-gradient" />
      <div className="veil-layer-noise" />
    </div>
  );
}
