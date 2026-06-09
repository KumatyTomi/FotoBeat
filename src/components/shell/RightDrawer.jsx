import { Palette } from 'lucide-react';
import AccordionGroup from '../ui/AccordionGroup.jsx';
import CollapsiblePanel from '../ui/CollapsiblePanel.jsx';

const GROUPS = ['Templates', 'Style', 'Photo Selection', 'Music', 'Audio Markers', 'Export', 'Batch'];

export default function RightDrawer({ collapsed, onToggle, activeProfile }) {
  return (
    <CollapsiblePanel title="Right Drawer" collapsed={collapsed} onToggle={onToggle} icon={<Palette size={18} />} side="right">
      <div className="right-drawer-groups">
        {GROUPS.map((group, index) => (
          <AccordionGroup key={group} title={group} defaultOpen={activeProfile === 'editor' && index === 0}>
            <p>{group} controls are ready for profile-aware sections.</p>
          </AccordionGroup>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
