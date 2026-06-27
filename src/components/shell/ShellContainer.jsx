import AnimatedTransition from '../ui/AnimatedTransition.jsx';
import CenterWorkspace from './CenterWorkspace.jsx';
import LeftRail from './LeftRail.jsx';
import RightDrawer from './RightDrawer.jsx';
import TopBar from './TopBar.jsx';
import { useCollapsible } from '../../hooks/useCollapsible.js';
import { useProfile } from '../../hooks/useProfile.js';
import { useGuiStore } from '../../stores/guiStore.js';

export default function ShellContainer({ children }) {
  const profile = useProfile();
  const layout = useCollapsible();
  const veilLayer = useGuiStore((state) => state.veilLayer);
  const phantomUi = useGuiStore((state) => state.phantomUi);

  const shellStyle = {
    '--profile-accent': profile.activeProfileDefinition.accent,
    '--veil-reactivity': veilLayer.reactivity,
    '--phantom-sphere-scale': phantomUi.sphereScale,
    '--phantom-sphere-glow': phantomUi.sphereGlow,
    '--phantom-sphere-orbit': phantomUi.sphereOrbit,
    '--phantom-sphere-particles': phantomUi.sphereParticles,
    '--phantom-motion-drift': phantomUi.motionDrift,
    '--phantom-motion-pulse': phantomUi.motionPulse,
    '--phantom-grid-energy': phantomUi.gridEnergy,
    '--phantom-glass-opacity': phantomUi.glassOpacity,
    '--phantom-focus-dim': phantomUi.focusDim,
    '--phantom-ui-density': phantomUi.uiDensity
  };

  return (
    <div className={`single-shell profile-${profile.activeProfile} transition-${profile.phase}`} style={shellStyle}>
      <TopBar
        profiles={profile.profiles}
        activeProfile={profile.activeProfile}
        onProfileChange={profile.switchProfile}
      />

      <div className="shell-grid">
        <LeftRail collapsed={layout.collapsed.leftRail} onToggle={() => layout.togglePanel('leftRail')} activeProfile={profile.activeProfile} />
        <CenterWorkspace activeProfile={profile.activeProfile}>{children}</CenterWorkspace>
        <RightDrawer collapsed={layout.collapsed.rightDrawer} onToggle={() => layout.togglePanel('rightDrawer')} activeProfile={profile.activeProfile} />
      </div>

      <AnimatedTransition active={profile.switching} profile={profile.activeProfileDefinition} phase={profile.phase} />
    </div>
  );
}
