// @ts-nocheck
import { Aperture, Layers3, Maximize2, Orbit } from 'lucide-react';
import { useGuiStore } from '../../stores/guiStore.js';

const PANELS = [
  { id: 'veil', label: 'Veil', icon: <Layers3 size={15} /> },
  { id: 'sphere', label: 'Sphere', icon: <Orbit size={15} /> },
  { id: 'motion', label: 'Motion', icon: <Aperture size={15} /> },
  { id: 'workspace', label: 'Space', icon: <Maximize2 size={15} /> }
];

export default function PhantomControls() {
  const veilLayer = useGuiStore((state) => state.veilLayer);
  const phantomUi = useGuiStore((state) => state.phantomUi);
  const setVeilLayer = useGuiStore((state) => state.setVeilLayer);
  const setPhantomUi = useGuiStore((state) => state.setPhantomUi);
  const resetVeilLayer = useGuiStore((state) => state.resetVeilLayer);
  const resetPhantomUi = useGuiStore((state) => state.resetPhantomUi);

  const activePanel = phantomUi.activePanel;

  return (
    <section className="phantom-control-shell noir-control-shell" aria-label="Phantom controls">
      <header className="phantom-control-head noir-control-head">
        <strong>Phantom Control</strong>
        <span>4 panele · noir cut</span>
      </header>

      <nav className="phantom-panel-tabs noir-panel-tabs" aria-label="Control categories">
        {PANELS.map((panel) => (
          <button
            key={panel.id}
            type="button"
            className={activePanel === panel.id ? 'active' : ''}
            onClick={() => setPhantomUi({ activePanel: panel.id })}
          >
            {panel.icon}
            <span>{panel.label}</span>
          </button>
        ))}
      </nav>

      <div className={`phantom-panel-body noir-panel-body panel-${activePanel}`}>
        <div key={activePanel} className={`noir-panel-scene scene-${activePanel}`}>
          <div className="noir-cut noir-cut-white" />
          <div className="noir-cut noir-cut-red" />
          <div className="noir-ink-flash" />
          <div className="noir-grain" />

          {activePanel === 'veil' ? (
            <ControlPanel title="Veil Layer" description="Tło Imagine i głębia oprawy.">
              <label className="phantom-url-field">
                <span>Imagine video/image URL</span>
                <input
                  type="url"
                  value={veilLayer.sourceUrl}
                  onChange={(event) => setVeilLayer({ sourceUrl: event.target.value })}
                  placeholder="Wklej URL lub lokalną ścieżkę"
                />
              </label>
              <div className="phantom-toggle-grid">
                <ToggleButton active={veilLayer.enabled} onClick={() => setVeilLayer({ enabled: !veilLayer.enabled })}>Veil {veilLayer.enabled ? 'On' : 'Off'}</ToggleButton>
                <ToggleButton active={veilLayer.sourceType === 'video'} onClick={() => setVeilLayer({ sourceType: 'video' })}>Video</ToggleButton>
                <ToggleButton active={veilLayer.sourceType === 'image'} onClick={() => setVeilLayer({ sourceType: 'image' })}>Image</ToggleButton>
                <ToggleButton active={veilLayer.flowMode} onClick={() => setVeilLayer({ flowMode: !veilLayer.flowMode })}>Flow</ToggleButton>
              </div>
              <Slider label="Opacity" value={veilLayer.opacity} min={0} max={0.86} step={0.01} onChange={(value) => setVeilLayer({ opacity: value })} />
              <Slider label="Blur" value={veilLayer.blur} min={0} max={42} step={1} onChange={(value) => setVeilLayer({ blur: value })} />
              <Slider label="Video speed" value={veilLayer.speed} min={0.25} max={2} step={0.05} onChange={(value) => setVeilLayer({ speed: value })} />
              <FooterButton onClick={resetVeilLayer}>Reset Veil</FooterButton>
            </ControlPanel>
          ) : null}

          {activePanel === 'sphere' ? (
            <ControlPanel title="Visual Sphere" description="Sfera, poświata i orbitalny ruch.">
              <div className="phantom-toggle-grid two">
                <ToggleButton active={veilLayer.sphereSync} onClick={() => setVeilLayer({ sphereSync: !veilLayer.sphereSync })}>Sphere sync</ToggleButton>
                <ToggleButton active={phantomUi.sphereParticles > 0.2} onClick={() => setPhantomUi({ sphereParticles: phantomUi.sphereParticles > 0.2 ? 0 : 0.72 })}>Particles</ToggleButton>
              </div>
              <Slider label="Size" value={phantomUi.sphereScale} min={0.72} max={1.42} step={0.01} onChange={(value) => setPhantomUi({ sphereScale: value })} />
              <Slider label="Glow" value={phantomUi.sphereGlow} min={0} max={1} step={0.01} onChange={(value) => setPhantomUi({ sphereGlow: value })} />
              <Slider label="Orbits" value={phantomUi.sphereOrbit} min={0} max={1} step={0.01} onChange={(value) => setPhantomUi({ sphereOrbit: value })} />
              <Slider label="Reactivity" value={veilLayer.reactivity} min={0} max={1} step={0.01} onChange={(value) => setVeilLayer({ reactivity: value })} />
              <FooterButton onClick={resetPhantomUi}>Reset Sphere</FooterButton>
            </ControlPanel>
          ) : null}

          {activePanel === 'motion' ? (
            <ControlPanel title="Motion" description="Ruch tła, puls i energia siatki.">
              <Slider label="Ambient drift" value={phantomUi.motionDrift} min={0} max={1} step={0.01} onChange={(value) => setPhantomUi({ motionDrift: value })} />
              <Slider label="Pulse" value={phantomUi.motionPulse} min={0} max={1} step={0.01} onChange={(value) => setPhantomUi({ motionPulse: value })} />
              <Slider label="Grid energy" value={phantomUi.gridEnergy} min={0} max={1} step={0.01} onChange={(value) => setPhantomUi({ gridEnergy: value })} />
              <Slider label="Veil saturation" value={veilLayer.saturation} min={0.4} max={2} step={0.01} onChange={(value) => setVeilLayer({ saturation: value })} />
              <FooterButton onClick={resetPhantomUi}>Reset Motion</FooterButton>
            </ControlPanel>
          ) : null}

          {activePanel === 'workspace' ? (
            <ControlPanel title="Workspace" description="Zagęszczenie UI i kontrast paneli.">
              <Slider label="Glass" value={phantomUi.glassOpacity} min={0.2} max={0.95} step={0.01} onChange={(value) => setPhantomUi({ glassOpacity: value })} />
              <Slider label="Focus dim" value={phantomUi.focusDim} min={0} max={0.72} step={0.01} onChange={(value) => setPhantomUi({ focusDim: value })} />
              <Slider label="UI density" value={phantomUi.uiDensity} min={0} max={1} step={0.01} onChange={(value) => setPhantomUi({ uiDensity: value })} />
              <div className="phantom-action-row">
                <a href="#upload">Media</a>
                <a href="#preview">Preview</a>
                <a href="#timeline">Timeline</a>
                <a href="#desktop-render">Render</a>
              </div>
              <FooterButton onClick={resetPhantomUi}>Reset Space</FooterButton>
            </ControlPanel>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ControlPanel({ title, description, children }) {
  return (
    <div className="phantom-panel-card noir-panel-card">
      <div className="phantom-panel-title noir-panel-title">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <div className="phantom-control-stack">{children}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label className="phantom-slider noir-slider">
      <span>{label}<b>{formatValue(value)}</b></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button type="button" className={active ? 'active' : ''} onClick={onClick}>{children}</button>
  );
}

function FooterButton({ onClick, children }) {
  return <button type="button" className="phantom-footer-button" onClick={onClick}>{children}</button>;
}

function formatValue(value) {
  if (value >= 10) return Math.round(value);
  return value.toFixed(2);
}
