import { Clock3, FolderKanban, Headphones, Image, LifeBuoy, Share2 } from 'lucide-react';
import CollapsiblePanel from '../ui/CollapsiblePanel.jsx';

const ITEMS = [
  { id: 'project', label: 'Project', icon: <FolderKanban size={18} /> },
  { id: 'media', label: 'Media', icon: <Image size={18} /> },
  { id: 'audio', label: 'Audio', icon: <Headphones size={18} /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock3 size={18} /> },
  { id: 'export', label: 'Export', icon: <Share2 size={18} /> },
  { id: 'support', label: 'Support', icon: <LifeBuoy size={18} /> }
];

export default function LeftRail({ collapsed, onToggle, activeProfile }) {
  return (
    <CollapsiblePanel title="Left Rail" collapsed={collapsed} onToggle={onToggle} icon={<FolderKanban size={18} />} side="left">
      <div className="left-rail-items">
        {ITEMS.map((item) => (
          <a key={item.id} href={`#${item.id === 'media' ? 'upload' : item.id}`} className="left-rail-item">
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
        <em>Profile: {activeProfile}</em>
      </div>
    </CollapsiblePanel>
  );
}
