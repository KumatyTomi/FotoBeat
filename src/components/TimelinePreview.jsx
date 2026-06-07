export default function TimelinePreview({ timeline }) {
  return (
    <section className="timeline-panel">
      <div className="section-heading">
        <h2>Roboczy timeline</h2>
        <p>{timeline.summary}</p>
      </div>

      <div className="timeline-strip">
        {timeline.clips.map((clip) => (
          <article key={clip.id} className="timeline-clip">
            <span>{clip.start}s</span>
            <strong>{clip.label}</strong>
            <em>{clip.effect}</em>
          </article>
        ))}
      </div>
    </section>
  );
}
