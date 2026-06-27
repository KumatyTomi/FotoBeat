import { SlidersHorizontal } from 'lucide-react';
import CollapsiblePanel from '../ui/CollapsiblePanel.jsx';
import PhantomControls from './PhantomControls.jsx';

export default function RightDrawer({ collapsed, onToggle, activeProfile }) {
  return (
    <CollapsiblePanel title="Phantom" collapsed={collapsed} onToggle={onToggle} icon={<SlidersHorizontal size={18} />} side="right">
      <div className="right-drawer-groups cockpit-right-drawer phantom-drawer" data-profile={activeProfile}>
        <PhantomControls />
      </div>
    </CollapsiblePanel>
  );
}
