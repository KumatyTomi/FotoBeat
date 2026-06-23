import { Clock3, Film, Gauge, Headphones, ImagePlus, LifeBuoy, Palette, Share2 } from 'lucide-react';
import CollapsiblePanel from '../ui/CollapsiblePanel.jsx';

const ITEMS = [
  { id: 'import', href: '#upload', label: 'Import', icon: <ImagePlus size={18} /> },
  { id: 'style', href: '#roadmap', label: 'Style DNA', icon: <Palette size={18} /> },
  { id: 'beat', href: '#preview', label: 'Beat Map', icon: <Gauge size={18} /> },
  { id: 'audio', href: '#upload', label: 'Audio', icon: <Headphones size={18} /> },
  { id: 'preview', href: '#preview', label: 'Preview', icon: <Film size={18} /> },
  { id: 'timeline', href: '#timeline', label: 'Timeline', icon: <Clock3 size={18} /> },
  { id: 'export', href: '#roadmap', label: 'Export', icon: <Share2 size={18} /> },
  { id: 'support', href: '#roadmap', label: 'Support', icon: <LifeBuoy size={18} /> }
];

export default function LeftRail({ collapsed, onToggle, activeProfile }) {
  return (
    <CollapsiblePanel title="Studio Rail" collapsed={collapsed} onToggle={onToggle} icon={<Film size={18} />} side="left">
      <div className="left-rail-items cockpit-left-rail-items">
        {ITEMS.map((item, index) => (
          <a key={item.id} href={item.href} className={index === 2 ? 'left-rail-item active' : 'left-rail-item'}>
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
        <em>Mode: {activeProfile}</em>
      </div>
    </CollapsiblePanel>
  );
}
