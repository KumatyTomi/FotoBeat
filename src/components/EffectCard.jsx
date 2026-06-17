function toEffectClassName(effectId) {
  const slug = effectId.replace(/([a-z0-9])([A-Z])/g, (_match, left, right) => `${left}-${right}`).toLowerCase();
  return `effect-card-${slug}`;
}

export default function EffectCard({ effect, active, onClick }) {
  const className = ['effect-card', toEffectClassName(effect.id), active ? 'active' : ''].filter(Boolean).join(' ');

  return (
    <button className={className} onClick={onClick}>
      <strong>{effect.name}</strong>
      <span>{effect.description}</span>
      {effect.bestFor && <em>{effect.bestFor}</em>}
    </button>
  );
}
