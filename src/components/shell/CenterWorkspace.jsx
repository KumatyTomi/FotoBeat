import ModePanel from './ModePanel.jsx';
import VisualSphere from './VisualSphere.jsx';
import { PROFILE_DEFINITIONS } from '../../hooks/useProfile.js';

export default function CenterWorkspace({ activeProfile, children }) {
  const profile = PROFILE_DEFINITIONS.find((item) => item.id === activeProfile) ?? PROFILE_DEFINITIONS[1];

  return (
    <main className={`center-workspace profile-${activeProfile} scene-${profile.scene}`}>
      <VisualSphere activeProfile={activeProfile} />
      <div className="center-workspace-header cosmic-workspace-header">
        <span>Interaktywny panel</span>
        <strong>{profile.shortLabel}</strong>
      </div>
      <ModePanel activeProfile={activeProfile} profile={profile} />
      <div className="cosmic-workspace-content" data-debug={activeProfile === 'debug' ? 'enabled' : 'hidden'}>
        {children}
      </div>
    </main>
  );
}
