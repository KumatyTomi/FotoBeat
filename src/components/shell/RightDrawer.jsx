import { Activity, CheckSquare, ClipboardList, Film, FolderKanban, Headphones, ImagePlus, ListChecks, MonitorDown, Palette, Scissors, Settings2, Share2, SlidersHorizontal, Wrench } from 'lucide-react';
import AccordionGroup from '../ui/AccordionGroup.jsx';
import CollapsiblePanel from '../ui/CollapsiblePanel.jsx';

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
  return (
    <CollapsiblePanel title="Controls" collapsed={collapsed} onToggle={onToggle} icon={<SlidersHorizontal size={18} />} side="right">
      <div className="right-drawer-groups cockpit-right-drawer pragmatic-side-sliders" data-profile={activeProfile}>
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
                    <input type="range" min="0" max="100" value={slider.value} readOnly aria-label={slider.label} />
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
