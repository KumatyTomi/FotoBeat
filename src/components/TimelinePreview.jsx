export default function TimelinePreview({ timeline }) {
  return (
    <section className="timeline-panel">
      <div className="section-heading">
        <div>
          <h2>Roboczy timeline</h2>
          <p>{timeline.summary}</p>
        </div>
        <div className="timeline-meta">
          <span>{timeline.clips.length} klipów</span>
          <span>{timeline.estimatedDuration}s</span>
          <span>{timeline.format}</span>
        </div>
      </div>

      <div className="timeline-strip">
        {timeline.clips.map((clip) => (
          <article key={clip.id} className={`timeline-clip section-${clip.section}`}>
            <span>{clip.start}s · {clip.duration}s</span>
            <strong>{clip.label}</strong>
            <em>{clip.section} · {clip.effect}</em>
            <div className="energy-meter" aria-label={`Energia ${Math.round(clip.energy * 100)}%`}>
              <i style={{ width: `${Math.round(clip.energy * 100)}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
