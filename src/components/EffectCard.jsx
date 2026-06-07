export default function EffectCard({ effect, active, onClick }) {
  return (
    <button className={active ? 'effect-card active' : 'effect-card'} onClick={onClick}>
      <strong>{effect.name}</strong>
      <span>{effect.description}</span>
    </button>
  );
}
