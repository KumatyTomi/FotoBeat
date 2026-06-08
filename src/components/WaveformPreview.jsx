export default function WaveformPreview({ analysis, durationScale }) {
  const waveform = analysis?.waveform ?? [];
  const beats = analysis?.beats ?? [];
  const duration = Math.max(analysis?.duration ?? 0, 1);

  if (!waveform.length) {
    return <div className="waveform-empty">Waveform pojawi się po analizie audio.</div>;
  }

  return (
    <div className="waveform-box">
      <div className="waveform-bars">
        {waveform.map((value, index) => (
          <span key={`wf-${index}`} style={{ height: `${Math.max(8, value * 100)}%` }} />
        ))}
      </div>
      <div className="beat-grid">
        {beats.slice(0, 48).map((beat, index) => (
          <i
            key={`beat-${index}`}
            style={{
              left: `${Math.min(100, ((beat.time * durationScale) / (duration * durationScale)) * 100)}%`,
              opacity: 0.35 + beat.energy * 0.55
            }}
          />
        ))}
      </div>
    </div>
  );
}
