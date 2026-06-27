// @ts-nocheck
import { Layers3 } from 'lucide-react';
import AccordionGroup from '../ui/AccordionGroup.jsx';
import { useGuiStore } from '../../stores/guiStore.js';

export default function VeilControls() {
  const veilLayer = useGuiStore((state) => state.veilLayer);
  const setVeilLayer = useGuiStore((state) => state.setVeilLayer);
  const resetVeilLayer = useGuiStore((state) => state.resetVeilLayer);

  return (
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
