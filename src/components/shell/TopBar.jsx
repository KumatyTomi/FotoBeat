import { CheckCircle2, LockKeyhole, Maximize2, Minus, Sparkles, X } from 'lucide-react';
import PremiumButton from '../ui/PremiumButton.jsx';

export default function TopBar({ profiles, activeProfile, onProfileChange }) {
  const active = profiles.find((item) => item.id === activeProfile) ?? profiles[0];

  return (
    <header className="shell-topbar cockpit-topbar cosmic-topbar">
      <div className="shell-brand cockpit-brand">
        <Sparkles size={18} />
        <div>
          <strong>FotoBeat.me</strong>
          <span>{active?.shortLabel ?? 'Local video studio'}</span>
        </div>
      </div>

      <nav className="profile-switcher cockpit-mode-switcher cosmic-panel-switcher" aria-label="Interaktywne panele FotoBeat">
        {profiles.map((item, index) => (
          <button
            key={item.id}
            className={item.id === activeProfile ? 'active' : ''}
            onClick={() => onProfileChange(item.id)}
            style={{ '--profile-accent': item.accent }}
            aria-current={item.id === activeProfile ? 'page' : undefined}
            title={item.description}
          >
            <span className="panel-switch-index">0{index + 1}</span>
            <span className="panel-switch-copy">
              <strong>{item.label}</strong>
              <em>{item.shortLabel}</em>
            </span>
          </button>
        ))}
      </nav>

      <div className="shell-window-meta cockpit-window-meta">
        <PremiumButton variant="ghost" className="shell-title-pill cockpit-render-pill cosmic-active-pill">
          {activeProfile === 'debug' ? <LockKeyhole size={14} /> : <CheckCircle2 size={14} />}
          {activeProfile === 'debug' ? 'Admin Debug' : 'Workspace Ready'}
        </PremiumButton>
        <span className="window-dot"><Minus size={14} /></span>
        <span className="window-dot"><Maximize2 size={13} /></span>
        <span className="window-dot close"><X size={14} /></span>
      </div>
    </header>
  );
}
