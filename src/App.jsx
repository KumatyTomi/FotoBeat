import { useMemo, useState } from 'react';
import { ImagePlus, Music, Sparkles, Wand2, Film, Download, RefreshCcw } from 'lucide-react';
import FileDropzone from './components/FileDropzone.jsx';
import TimelinePreview from './components/TimelinePreview.jsx';
import EffectCard from './components/EffectCard.jsx';
import { EFFECT_PRESETS, EXPORT_FORMATS } from './data/effects.js';
import { buildDraftTimeline } from './utils/timeline.js';

export default function App() {
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [format, setFormat] = useState('vertical');
  const [preset, setPreset] = useState('neonPulse');

  const timeline = useMemo(() => {
    return buildDraftTimeline({ images, audio, format, preset });
  }, [images, audio, format, preset]);

  const selectedFormat = EXPORT_FORMATS.find((item) => item.id === format);
  const selectedPreset = EFFECT_PRESETS.find((item) => item.id === preset);

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={18} />
            FotoBeat.me · AI video editor
          </div>
          <h1>Zdjęcia + muzyka = klip zsynchronizowany z beatem.</h1>
          <p>
            Wrzuć zdjęcia i MP3. Prototyp buduje roboczy timeline, dobiera tempo przejść
            i pokazuje strukturę montażu pod dalszy render.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#upload">
              <Wand2 size={18} />
              Zbuduj projekt
            </a>
            <a className="ghost-button" href="#roadmap">
              <Film size={18} />
              Roadmapa
            </a>
          </div>
        </div>

        <div className="preview-card">
          <div className="orb orb-a" />
          <div className="orb orb-b" />
          <div className="mock-video-frame">
            <span>FotoBeat</span>
            <strong>{selectedFormat?.label}</strong>
            <em>{selectedPreset?.name}</em>
          </div>
        </div>
      </section>

      <section id="upload" className="workspace-grid">
        <FileDropzone
          icon={<ImagePlus />}
          title="Zdjęcia"
          description="JPG, PNG, WEBP. Możesz wrzucić całą paczkę kadrów."
          accept="image/*"
          multiple
          files={images}
          onFiles={setImages}
        />

        <FileDropzone
          icon={<Music />}
          title="Muzyka"
          description="MP3/WAV. Jeden plik audio do synchronizacji montażu."
          accept="audio/*"
          multiple={false}
          files={audio ? [audio] : []}
          onFiles={(next) => setAudio(next[0] ?? null)}
        />
      </section>

      <section className="control-panel">
        <div>
          <h2>Format eksportu</h2>
          <div className="button-row">
            {EXPORT_FORMATS.map((item) => (
              <button
                key={item.id}
                className={format === item.id ? 'chip active' : 'chip'}
                onClick={() => setFormat(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2>Preset efektów</h2>
          <div className="preset-grid">
            {EFFECT_PRESETS.map((item) => (
              <EffectCard
                key={item.id}
                effect={item}
                active={preset === item.id}
                onClick={() => setPreset(item.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <TimelinePreview timeline={timeline} />

      <section id="roadmap" className="roadmap-panel">
        <div>
          <h2>Następne moduły</h2>
          <p>
            Ten frontend jest bazą pod Base44/Vite. Kolejne kroki: realna analiza audio,
            render queue, eksport MP4 i biblioteka szablonów.
          </p>
        </div>

        <div className="roadmap-list">
          <span><RefreshCcw size={16} /> Autosave + snapshots</span>
          <span><Film size={16} /> Render MP4 16:9 / 9:16</span>
          <span><Download size={16} /> Paczki eksportowe ZIP</span>
        </div>
      </section>
    </main>
  );
}
