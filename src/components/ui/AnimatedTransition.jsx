export default function AnimatedTransition({ active, profile, phase }) {
  return (
    <div
      className={`profile-transition-overlay ${active ? 'active' : ''} phase-${phase}`}
      style={{ '--profile-accent': profile?.accent ?? '#8be9ff' }}
      aria-hidden="true"
    />
  );
}
