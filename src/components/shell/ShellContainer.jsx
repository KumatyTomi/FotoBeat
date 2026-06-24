import AnimatedTransition from '../ui/AnimatedTransition.jsx';
import CenterWorkspace from './CenterWorkspace.jsx';
import LeftRail from './LeftRail.jsx';
import RightDrawer from './RightDrawer.jsx';
import TopBar from './TopBar.jsx';
import { useCollapsible } from '../../hooks/useCollapsible.js';
import { useProfile } from '../../hooks/useProfile.js';

export default function ShellContainer({ children }) {
  const profile = useProfile();
  const layout = useCollapsible();

  return (
    <div className={`single-shell profile-${profile.activeProfile} transition-${profile.phase}`} style={{ '--profile-accent': profile.activeProfileDefinition.accent }}>
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
