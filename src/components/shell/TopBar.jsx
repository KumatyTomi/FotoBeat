import { CheckCircle2, Maximize2, Minus, X } from 'lucide-react';
import AppIcon from '../ui/AppIcon.jsx';
import PremiumButton from '../ui/PremiumButton.jsx';

export default function TopBar() {
  return (
    <header className="shell-topbar workspace-topbar">
      <div className="shell-brand">
        <span className="shell-brand-mark"><AppIcon /></span>
        <div>
          <strong>FotoBeat.me</strong>
          <span>Premium desktop studio</span>
        </div>
      </div>

      <div className="workspace-topbar-center">
        <strong>Preview + timeline workspace</strong>
        <span>Local-first MP4 render, bez stałych sliderów</span>
      </div>

      <div className="shell-window-meta">
        <PremiumButton variant="ghost" className="shell-title-pill"><CheckCircle2 size={14} />Studio ready</PremiumButton>
        <span className="window-dot"><Minus size={14} /></span>
        <span className="window-dot"><Maximize2 size={13} /></span>
        <span className="window-dot close"><X size={14} /></span>
      </div>
    </header>
  );
}
