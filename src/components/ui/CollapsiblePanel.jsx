import { ChevronRight } from 'lucide-react';

export default function CollapsiblePanel({ title, icon, collapsed = true, onToggle, children, side = 'left' }) {
  return (
    <aside className={`collapsible-panel ${side} ${collapsed ? 'collapsed' : 'expanded'}`}>
      <button className="collapsible-panel-toggle" onClick={onToggle} aria-expanded={!collapsed} title={collapsed ? `Rozwiń ${title}` : `Zwiń ${title}`}>
        <span className="collapsible-panel-icon">{icon}</span>
        <strong>{title}</strong>
        <ChevronRight size={16} className="collapsible-panel-chevron" />
      </button>
      <div className="collapsible-panel-body" aria-hidden={collapsed}>
        {children}
      </div>
    </aside>
  );
}
