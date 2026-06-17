function toEffectClassName(effectId) {
  return `effect-card-${effectId.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
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
