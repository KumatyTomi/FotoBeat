import { Activity, CheckSquare, ClipboardList, Film, FolderKanban, Headphones, ImagePlus, Layers3, ListChecks, MonitorDown, Palette, Scissors, Settings2, Share2, SlidersHorizontal, Wrench } from 'lucide-react';
import AccordionGroup from '../ui/AccordionGroup.jsx';
import CollapsiblePanel from '../ui/CollapsiblePanel.jsx';
import { useGuiStore } from '../../stores/guiStore.js';

const DRAWER_SECTIONS = [
  {
    title: 'Project',
    icon: <FolderKanban size={15} />,
    defaultOpen: true,
    sliders: [
      { label: 'Autosave', value: 100, tone: 'green' },
      { label: 'Snapshots', value: 68, tone: 'cyan' }
    ],
    actions: [
      { label: 'Project panel', href: '#project' },
      { label: 'Export JSON', href: '#project' },
      { label: 'Import JSON', href: '#project' }
    ]
  },
  {
    title: 'Import & Media',
    icon: <ImagePlus size={15} />,
    defaultOpen: true,
    sliders: [
      { label: 'Selection', value: 78, tone: 'cyan' },
      { label: 'Format fit', value: 62, tone: 'violet' },
      { label: 'Pins', value: 48, tone: 'pink' }
    ],
    actions: [
      { label: 'Add photos', href: '#upload' },
      { label: 'Select frames', href: '#upload' },
      { label: 'Timeline pins', href: '#timeline' }
    ]
  },
  {
    title: 'Audio & Beat',
    icon: <Headphones size={15} />,
    defaultOpen: false,
    sliders: [
      { label: 'Beat density', value: 72, tone: 'cyan' },
      { label: 'Cut energy', value: 64, tone: 'amber' },
      { label: 'Clip scale', value: 50, tone: 'violet' }
    ],
    actions: [
      { label: 'Add audio', href: '#upload' },
      { label: 'Waveform', href: '#preview' },
      { label: 'Beat grid', href: '#preview' }
    ]
  },
  {
    title: 'Timeline',
    icon: <Scissors size={15} />,
    defaultOpen: false,
    sliders: [
      { label: 'Order', value: 74, tone: 'cyan' },
      { label: 'Pinned clips', value: 58, tone: 'green' },
      { label: 'Preview pace', value: 67, tone: 'pink' }
    ],
    actions: [
      { label: 'Move frames', href: '#timeline' },
      { label: 'Pin to clip', href: '#timeline' },
      { label: 'Preview clip', href: '#preview' }
    ]
  },
  {
    title: 'Style',
    icon: <Palette size={15} />,
    defaultOpen: false,
    sliders: [
      { label: 'Motion', value: 76, tone: 'cyan' },
      { label: 'Glow', value: 58, tone: 'pink' },
      { label: 'Contrast', value: 84, tone: 'violet' }
    ],
    actions: [
      { label: 'Preset', href: '#preview' },
      { label: 'Format', href: '#preview' },
      { label: 'Intensity', href: '#preview' }
    ]
  },
  {
    title: 'Export',
    icon: <Share2 size={15} />,
    defaultOpen: true,
    sliders: [
      { label: 'PNG frame', value: 100, tone: 'green' },
      { label: 'Frames ZIP', value: 100, tone: 'green' },
      { label: 'MP4 path', value: 72, tone: 'amber' }
    ],
    actions: [
      { label: 'Single frame', href: '#preview' },
      { label: 'Frame sequence', href: '#preview' },
      { label: 'MP4/WebM', href: '#preview' }
    ]
  },
  {
    title: 'Desktop Render',
    icon: <MonitorDown size={15} />,
    defaultOpen: false,
    sliders: [
      { label: 'FFmpeg', value: 70, tone: 'amber' },
      { label: 'Output folder', value: 64, tone: 'cyan' },
      { label: 'Job history', value: 52, tone: 'violet' }
    ],
    actions: [
      { label: 'Choose folder', href: '#desktop-render' },
      { label: 'Create job', href: '#desktop-render' },
      { label: 'History', href: '#desktop-render' }
    ]
  },
  {
    title: 'Diagnostics',
    icon: <Wrench size={15} />,
    defaultOpen: false,
    sliders: [
      { label: 'Storage', value: 60, tone: 'cyan' },
      { label: 'Contracts', value: 100, tone: 'green' },
      { label: 'Build safety', value: 100, tone: 'green' }
    ],
    actions: [
      { label: 'Render status', href: '#preview' },
      { label: 'Roadmap', href: '#roadmap' },
      { label: 'Support', href: '#roadmap' }
    ]
  }
];

const ESSENTIAL_CHECKS = [
  'Project saved locally',
  'Media state preserved',
  'Electron asset check',
  'Installer workflow'
];

export default function RightDrawer({ collapsed, onToggle, activeProfile }) {
  const veilLayer = useGuiStore((state) => state.veilLayer);
  const setVeilLayer = useGuiStore((state) => state.setVeilLayer);
  const resetVeilLayer = useGuiStore((state) => state.resetVeilLayer);

  return (
    <CollapsiblePanel title="Controls" collapsed={collapsed} onToggle={onToggle} icon={<SlidersHorizontal size={18} />} side="right">
      <div className="right-drawer-groups cockpit-right-drawer pragmatic-side-sliders" data-profile={activeProfile}>
        <AccordionGroup title="Veil Layer" defaultOpen>
          <div className="veil-control-panel">
            <header className="side-slider-header">
              <Layers3 size={15} />
              <span>Imagine ambient</span>
            </header>

            <label className="veil-url-field">
              <span>Imagine video/image URL</span>
              <input
                type="url"
                value={veilLayer.sourceUrl}
                onChange={(event) => setVeilLayer({ sourceUrl: event.target.value })}
                placeholder="Wklej lokalny lub zewnętrzny URL video"
              />
            </label>

            <div className="veil-toggle-grid">
              <button type="button" className={veilLayer.enabled ? 'active' : ''} onClick={() => setVeilLayer({ enabled: !veilLayer.enabled })}>Veil {veilLayer.enabled ? 'On' : 'Off'}</button>
              <button type="button" className={veilLayer.sourceType === 'video' ? 'active' : ''} onClick={() => setVeilLayer({ sourceType: 'video' })}>Video</button>
              <button type="button" className={veilLayer.sourceType === 'image' ? 'active' : ''} onClick={() => setVeilLayer({ sourceType: 'image' })}>Image</button>
              <button type="button" className={veilLayer.sphereSync ? 'active' : ''} onClick={() => setVeilLayer({ sphereSync: !veilLayer.sphereSync })}>Sphere sync</button>
            </div>

            <div className="side-slider-stack">
              <VeilSlider label="Opacity" value={veilLayer.opacity} min="0" max="0.86" step="0.01" tone="cyan" onChange={(value) => setVeilLayer({ opacity: value })} />
              <VeilSlider label="Blur" value={veilLayer.blur} min="0" max="42" step="1" tone="violet" onChange={(value) => setVeilLayer({ blur: value })} />
              <VeilSlider label="Speed" value={veilLayer.speed} min="0.25" max="2" step="0.05" tone="amber" onChange={(value) => setVeilLayer({ speed: value })} />
              <VeilSlider label="Reactivity" value={veilLayer.reactivity} min="0" max="1" step="0.01" tone="pink" onChange={(value) => setVeilLayer({ reactivity: value })} />
            </div>

            <button type="button" className="veil-reset-button" onClick={resetVeilLayer}>Reset Veil</button>
          </div>
        </AccordionGroup>

        {DRAWER_SECTIONS.map((section) => (
          <AccordionGroup key={section.title} title={section.title} defaultOpen={section.defaultOpen}>
            <div className="side-slider-group">
              <header className="side-slider-header">
                {section.icon}
                <span>{section.title}</span>
              </header>

              <div className="side-slider-stack">
                {section.sliders.map((slider) => (
                  <label key={slider.label} className={`cockpit-range side-slider tone-${slider.tone}`}>
                    <span>{slider.label}</span>
                    <input type="range" min="0" max="100" defaultValue={slider.value} aria-label={slider.label} />
                    <i><b style={{ width: `${slider.value}%` }} /></i>
                  </label>
                ))}
              </div>

              <div className="side-action-grid">
                {section.actions.map((action) => (
                  <a key={action.label} href={action.href}>{action.label}</a>
                ))}
              </div>
            </div>
          </AccordionGroup>
        ))}

        <AccordionGroup title="Essential checks" defaultOpen>
          <div className="cockpit-readiness-list">
            {ESSENTIAL_CHECKS.map((item) => (
              <span key={item}><CheckSquare size={15} />{item}</span>
            ))}
          </div>
        </AccordionGroup>

        <div className="drawer-utility-strip" aria-label="Core workspace shortcuts">
          <a href="#project"><ClipboardList size={14} />Project</a>
          <a href="#upload"><ImagePlus size={14} />Media</a>
          <a href="#preview"><Film size={14} />Preview</a>
          <a href="#timeline"><Activity size={14} />Timeline</a>
          <a href="#roadmap"><ListChecks size={14} />Plan</a>
          <a href="#desktop-render"><Settings2 size={14} />Desktop</a>
        </div>
      </div>
    </CollapsiblePanel>
  );
}

function VeilSlider({ label, value, min, max, step, tone, onChange }) {
  return (
    <label className={`cockpit-range side-slider veil-live-slider tone-${tone}`}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`Veil ${label}`}
      />
    </label>
  );
}
