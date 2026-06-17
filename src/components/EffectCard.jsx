export default function EffectCard({ effect, active, onClick }) {
  const className = ['effect-card', `effect-card-${effect.id}`, active ? 'active' : ''].filter(Boolean).join(' ');

  return (
    <button className={className} onClick={onClick}>
      <strong>{effect.name}</strong>
      <span>{effect.description}</span>
      {effect.bestFor && <em>{effect.bestFor}</em>}
    </button>
  );
}
