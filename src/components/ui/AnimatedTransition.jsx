export default function AnimatedTransition({ active, profile, phase }) {
  return (
    <div
      className={`profile-transition-overlay cosmic-transition-overlay ${active ? 'active' : ''} phase-${phase} scene-${profile?.scene ?? 'liquid-gate'}`}
      style={{ '--profile-accent': profile?.accent ?? '#8be9ff' }}
      aria-hidden="true"
    >
      <span />
      <i />
    </div>
  );
}
