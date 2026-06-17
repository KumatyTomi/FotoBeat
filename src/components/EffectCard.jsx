export default function EffectCard({ effect, active, onClick }) {
  const effectClassName = `effect-card-${effect.id.toLowerCase()}`;
  const className = ['effect-card', effectClassName, active ? 'active' : ''].filter(Boolean).join(' ');

  return (
    <button className={className} onClick={onClick}>
      <strong>{effect.name}</strong>
      <span>{effect.description}</span>
      {effect.bestFor && <em>{effect.bestFor}</em>}
    </button>
  );
}
