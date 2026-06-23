import { CheckCircle2, Film, Gauge, Layers3, Palette, SlidersHorizontal, Sparkles, Wand2, Zap } from 'lucide-react';
import AccordionGroup from '../ui/AccordionGroup.jsx';
import CollapsiblePanel from '../ui/CollapsiblePanel.jsx';

const DNA_CONTROLS = [
  { label: 'Tempo', value: 72, tone: 'cyan' },
  { label: 'Mood', value: 42, tone: 'violet' },
  { label: 'Transition Intensity', value: 88, tone: 'pink' }
];

const PRESETS = ['Retro Video', 'Neon Pulse', 'Nature Flow', 'Neon Vibe', 'Natural Flow', 'Nebula Pulse'];

const READINESS = [
  'Audio sync OK',
  'Style DNA applied',
  'Render quality best',
  'Native MP4 ready'
];

export default function RightDrawer({ collapsed, onToggle, activeProfile }) {
  return (
    <CollapsiblePanel title="Style DNA" collapsed={collapsed} onToggle={onToggle} icon={<Palette size={18} />} side="right">
      <div className="right-drawer-groups cockpit-right-drawer" data-profile={activeProfile}>
        <AccordionGroup title="Style DNA" defaultOpen>
          <div className="cockpit-dna-panel">
            {DNA_CONTROLS.map((control) => (
              <label key={control.label} className={`cockpit-range tone-${control.tone}`}>
                <span>{control.label}</span>
                <i><b style={{ width: `${control.value}%` }} /></i>
              </label>
            ))}
          </div>
        </AccordionGroup>

        <AccordionGroup title="DNA Presets" defaultOpen={activeProfile !== 'simple'}>
          <div className="cockpit-preset-grid">
            {PRESETS.map((preset, index) => (
              <button key={preset} className={index === 1 ? 'active' : ''} type="button">
                <Sparkles size={14} />
                <span>{preset}</span>
              </button>
            ))}
          </div>
        </AccordionGroup>

        <AccordionGroup title="Beat Director" defaultOpen={activeProfile === 'editor'}>
          <div className="cockpit-beat-card">
            <div><Gauge size={17} /><strong>128 BPM</strong><span>auto detect</span></div>
            <div><Zap size={17} /><strong>42 markers</strong><span>drop cuts</span></div>
            <div><Layers3 size={17} /><strong>4 scenes</strong><span>intro / build / drop / outro</span></div>
          </div>
        </AccordionGroup>

        <AccordionGroup title="Export Readiness" defaultOpen>
          <div className="cockpit-readiness-list">
            {READINESS.map((item) => (
              <span key={item}><CheckCircle2 size={15} />{item}</span>
            ))}
          </div>
          <button className="cockpit-export-button" type="button"><Film size={16} /> Export Native MP4</button>
        </AccordionGroup>

        <AccordionGroup title="Quick Actions">
          <div className="cockpit-action-row">
            <button type="button"><Wand2 size={15} /> Rebuild</button>
            <button type="button"><SlidersHorizontal size={15} /> Fine tune</button>
          </div>
        </AccordionGroup>
      </div>
    </CollapsiblePanel>
  );
}
