import { Maximize2, Minus, Sparkles, X, Zap } from 'lucide-react';
import PremiumButton from '../ui/PremiumButton.jsx';

export default function TopBar({ profile, profiles, activeProfile, onProfileChange }) {
  return (
    <header className="shell-topbar cockpit-topbar">
      <div className="shell-brand cockpit-brand">
        <Sparkles size={18} />
        <div>
          <strong>FotoBeat.me</strong>
          <span>Local video studio</span>
        </div>
      </div>

      <nav className="profile-switcher cockpit-mode-switcher" aria-label="Profile switcher">
        {profiles.map((item) => (
          <button
            key={item.id}
            className={item.id === activeProfile ? 'active' : ''}
            onClick={() => onProfileChange(item.id)}
            style={{ '--profile-accent': item.accent }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="shell-window-meta cockpit-window-meta">
        <PremiumButton variant="ghost" className="shell-title-pill cockpit-render-pill"><Zap size={14} /> Native MP4 Ready</PremiumButton>
        <span className="window-dot"><Minus size={14} /></span>
        <span className="window-dot"><Maximize2 size={13} /></span>
        <span className="window-dot close"><X size={14} /></span>
      </div>
    </header>
  );
}
