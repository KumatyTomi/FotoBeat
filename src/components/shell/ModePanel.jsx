import { Activity, Bug, Clapperboard, Download, Gauge, ImagePlus, LockKeyhole, Music, Play, Settings2, SlidersHorizontal, Sparkles, Wand2 } from 'lucide-react';

const PANEL_CONTENT = {
  simple: {
    eyebrow: 'Start bez chaosu',
    title: 'Wrzuć zdjęcia i muzykę, resztę prowadzi panel.',
    body: 'Ten widok pokazuje tylko niezbędne kroki: import, szybkie ustawienie projektu, podgląd i bezpieczny start renderu. Opcje JSON i technikalia są schowane.',
    metrics: ['Import zdjęć', 'Audio MP3', 'Autosave', 'Podgląd'],
    actions: [
      { href: '#upload', icon: <ImagePlus size={17} />, label: 'Dodaj media' },
      { href: '#project', icon: <Wand2 size={17} />, label: 'Nazwij projekt' },
      { href: '#preview', icon: <Play size={17} />, label: 'Podgląd' }
    ],
    sliders: [
      { label: 'Płynność przejść', value: 84 },
      { label: 'Czytelność UI', value: 92 },
      { label: 'Automatyka', value: 76 }
    ]
  },
  creator: {
    eyebrow: 'Studio premium',
    title: 'Kreacja działa jak żywy panel, nie jak zmiana koloru.',
    body: 'Panel studia steruje stylem: liquid glass, neon, rytm, dramaturgia i energia beatów. Tło reaguje miękkim crossfadem, falą i cząstkami.',
    metrics: ['Style DNA', 'Beat feel', 'Neon glow', 'Liquid gate'],
    actions: [
      { href: '#preview', icon: <Sparkles size={17} />, label: 'Styl' },
      { href: '#timeline', icon: <Clapperboard size={17} />, label: 'Timeline' },
      { href: '#upload', icon: <Music size={17} />, label: 'Audio' }
    ],
    sliders: [
      { label: 'Glow', value: 88 },
      { label: 'Motion blur', value: 64 },
      { label: 'Beat sync', value: 81 }
    ]
  },
  editor: {
    eyebrow: 'Render engine',
    title: 'Podgląd, klatki, timeline i eksport w jednym trybie.',
    body: 'Panel renderu skupia kontrolki eksportu, sekwencję PNG, MP4/WebM i lokalne zadania desktopowe. To tryb pracy, nie dekoracja.',
    metrics: ['Canvas', 'Frame ZIP', 'MP4 POC', 'Desktop render'],
    actions: [
      { href: '#preview', icon: <Play size={17} />, label: 'Preview' },
      { href: '#desktop-render', icon: <Settings2 size={17} />, label: 'Desktop job' },
      { href: '#preview', icon: <Download size={17} />, label: 'Eksport' }
    ],
    sliders: [
      { label: 'FPS safety', value: 72 },
      { label: 'Export path', value: 69 },
      { label: 'Queue clarity', value: 86 }
    ]
  },
  debug: {
    eyebrow: 'Admin debug',
    title: 'Techniczne opcje są widoczne tylko tutaj.',
    body: 'JSON, manifesty, diagnostyka, kontrakty i opcje inspekcji nie są już widoczne w zwykłych panelach. Ten tryb jest celowo odseparowany.',
    metrics: ['JSON enabled', 'Diagnostics', 'Contracts', 'Local logs'],
    actions: [
      { href: '#project', icon: <Bug size={17} />, label: 'JSON project' },
      { href: '#roadmap', icon: <Activity size={17} />, label: 'Diagnostyka' },
      { href: '#desktop-render', icon: <LockKeyhole size={17} />, label: 'Admin render' }
    ],
    sliders: [
      { label: 'Log depth', value: 100 },
      { label: 'Payload view', value: 100 },
      { label: 'Safety checks', value: 94 }
    ]
  }
};

export default function ModePanel({ activeProfile, profile }) {
  const content = PANEL_CONTENT[activeProfile] ?? PANEL_CONTENT.creator;

  return (
    <section className={`mode-panel mode-panel-${activeProfile}`} aria-label={profile.shortLabel}>
      <div className="mode-panel-backdrop" />
      <div className="mode-panel-copy">
        <p className="mode-panel-eyebrow"><Sparkles size={16} />{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p>{content.body}</p>
        <div className="mode-panel-actions">
          {content.actions.map((action) => (
            <a key={action.label} href={action.href}>{action.icon}{action.label}</a>
          ))}
        </div>
      </div>

      <div className="mode-panel-console">
        <div className="mode-panel-orb"><Gauge size={34} /></div>
        <div className="mode-metric-grid">
          {content.metrics.map((metric) => (
            <span key={metric}>{metric}</span>
          ))}
        </div>
        <div className="mode-slider-stack">
          {content.sliders.map((slider) => (
            <label key={slider.label}>
              <span><SlidersHorizontal size={13} />{slider.label}<b>{slider.value}%</b></span>
              <i><em style={{ width: `${slider.value}%` }} /></i>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
