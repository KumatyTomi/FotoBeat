import { useGuiStore } from '../../stores/guiStore.js';

export default function VisualSphere({ activeProfile = 'creator' }) {
  const veilLayer = useGuiStore((state) => state.veilLayer);
  const sphereStyle = veilLayer.sphereSync ? { '--veil-reactivity': veilLayer.reactivity } : undefined;

  return (
    <div className={`visual-sphere sphere-${activeProfile} ${veilLayer.sphereSync ? 'sphere-veil-sync' : ''}`} style={sphereStyle} aria-hidden="true">
      <div className="sphere-aura sphere-aura-cyan" />
      <div className="sphere-aura sphere-aura-violet" />
      <div className="sphere-core">
        <div className="sphere-glass" />
        <div className="sphere-grid sphere-grid-horizontal" />
        <div className="sphere-grid sphere-grid-vertical" />
        <div className="sphere-light sphere-light-primary" />
        <div className="sphere-light sphere-light-secondary" />
      </div>
      <div className="sphere-ring sphere-ring-one" />
      <div className="sphere-ring sphere-ring-two" />
      <div className="sphere-ring sphere-ring-three" />
      <div className="sphere-particle particle-one" />
      <div className="sphere-particle particle-two" />
      <div className="sphere-particle particle-three" />
      <div className="sphere-particle particle-four" />
    </div>
  );
}
