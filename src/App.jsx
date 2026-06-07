import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Music, Sparkles, Wand2, Film, Download, RefreshCcw, Save, FileJson } from 'lucide-react';
import FileDropzone from './components/FileDropzone.jsx';
import TimelinePreview from './components/TimelinePreview.jsx';
import EffectCard from './components/EffectCard.jsx';
import { EFFECT_PRESETS, EXPORT_FORMATS } from './data/effects.js';
import { buildDraftTimeline } from './utils/timeline.js';

const STORAGE_KEY = 'fotobeat.project.v1';
const DEFAULT_PROJECT = {
  name: 'Nowy projekt FotoBeat',
  format: 'vertical',
  preset: 'neonPulse',
  notes: '',
  snapshots: []
};

export default function App() {
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [project, setProject] = useState(() => loadProject());
  const [audioAnalysis, setAudioAnalysis] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(project.updatedAt ?? null);

  const format = project.format;
  const preset = project.preset;

  useEffect(() => {
    const nextProject = {
      ...project,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProject));
    setLastSavedAt(nextProject.updatedAt);
  }, [project]);

  useEffect(() => {
    if (!audio) {
      setAudioAnalysis(null);
      return;
    }

    let cancelled = false;
    setAudioAnalysis({ status: 'analyzing', fileName: audio.name });

    analyzeAudioFile(audio)
      .then((result) => {
        if (!cancelled) setAudioAnalysis(result);
      })
      .catch(() => {
        if (!cancelled) {
          setAudioAnalysis({
            status: 'fallback',
            fileName: audio.name,
            bpm: 120,
            energy: 0.62,
            averageBeatStep: 0.5,
            beats: buildFallbackBeats(120, 48)
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [audio]);

  const timeline = useMemo(() => {
    return buildDraftTimeline({ images, audio, format, preset, audioAnalysis });
  }, [images, audio, format, preset, audioAnalysis]);

  const selectedFormat = EXPORT_FORMATS.find((item) => item.id === format);
  const selectedPreset = EFFECT_PRESETS.find((item) => item.id === preset);

  function patchProject(patch) {
    setProject((current) => ({
      ...current,
      ...patch
    }));
  }

  function addSnapshot() {
    setProject((current) => ({
      ...current,
      snapshots: [
        {
          id: `snapshot-${Date.now()}`,
          createdAt: new Date().toISOString(),
          name: `${current.name || 'Projekt'} · ${timeline.clips.length} klipów`,
          format,
          preset,
          notes: current.notes,
          summary: timeline.summary,
          estimatedDuration: timeline.estimatedDuration
        },
        ...current.snapshots
      ].slice(0, 10)
    }));
  }

  function exportProject() {
    const payload = {
      schema: 'fotobeat.project.v1',
      exportedAt: new Date().toISOString(),
      project,
      timeline,
      media: {
        imageCount: images.length,
        audioName: audio?.name ?? null
      }
    };

    const json = JSON.stringify(payload, null, 2);
    navigator.clipboard?.writeText(json);
  }

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
            Wrzuć zdjęcia i MP3. Prototyp buduje roboczy timeline, analizuje energię audio
            i zapisuje stan projektu lokalnie pod dalszy render.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#upload">
              <Wand2 size={18} />
              Zbuduj projekt
            </a>
            <a className="ghost-button" href="#project">
              <FileJson size={18} />
              Panel projektu
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

      <section id="project" className="project-panel">
        <div className="section-heading project-heading">
          <div>
            <p className="panel-kicker">Projekt</p>
            <h2>Autosave, snapshoty i eksport</h2>
            <p>Stan projektu zapisuje się automatycznie w przeglądarce. Eksport JSON kopiuje projekt do schowka.</p>
          </div>
          <span className="autosave-pill">
            <Save size={15} />
            {lastSavedAt ? `Zapisano: ${new Date(lastSavedAt).toLocaleString('pl-PL')}` : 'Jeszcze nie zapisano'}
          </span>
        </div>

        <div className="project-grid">
          <label className="field-block">
            Nazwa projektu
            <input
              value={project.name}
              onChange={(event) => patchProject({ name: event.target.value })}
              placeholder="Nazwa projektu"
            />
          </label>

          <label className="field-block">
            Notatki kreatywne
            <textarea
              value={project.notes}
              onChange={(event) => patchProject({ notes: event.target.value })}
              placeholder="Np. klub, neon, szybkie cięcia, drop po 12 sekundzie..."
            />
          </label>

          <div className="project-actions">
            <button className="primary-button compact" onClick={addSnapshot}>
              <FileJson size={16} />
              Zrób snapshot
            </button>
            <button className="ghost-button compact" onClick={exportProject}>
              <Download size={16} />
              Kopiuj JSON
            </button>
          </div>
        </div>

        <div className="snapshot-list">
          {project.snapshots.length === 0 ? (
            <span className="empty-state">Brak snapshotów. Zapisz pierwszy wariant timeline.</span>
          ) : (
            project.snapshots.map((snapshot) => (
              <article key={snapshot.id} className="snapshot-card">
                <strong>{snapshot.name}</strong>
                <span>{new Date(snapshot.createdAt).toLocaleString('pl-PL')}</span>
                <em>{snapshot.format} · {snapshot.preset} · {snapshot.estimatedDuration}s</em>
              </article>
            ))
          )}
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

      <section className="audio-panel">
        <div>
          <p className="panel-kicker">Audio engine</p>
          <h2>Analiza utworu</h2>
          <p>{audioAnalysis ? describeAudioAnalysis(audioAnalysis) : 'Wrzuć audio, aby wygenerować beat mapę i szacunkowe BPM.'}</p>
        </div>
        <div className="audio-stats">
          <span>BPM: {audioAnalysis?.bpm ?? '—'}</span>
          <span>Energia: {audioAnalysis ? `${Math.round(audioAnalysis.energy * 100)}%` : '—'}</span>
          <span>Beatów: {audioAnalysis?.beats?.length ?? 0}</span>
        </div>
      </section>

      <section className="control-panel">
        <div>
          <h2>Format eksportu</h2>
          <div className="button-row">
            {EXPORT_FORMATS.map((item) => (
              <button
                key={item.id}
                className={format === item.id ? 'chip active' : 'chip'}
                onClick={() => patchProject({ format: item.id })}
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
                onClick={() => patchProject({ preset: item.id })}
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
            Ten frontend jest bazą pod Base44/Vite. Kolejne kroki: render preview canvas,
            import projektu JSON, kolejka renderowania i eksport MP4.
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

function loadProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PROJECT, ...JSON.parse(raw) } : DEFAULT_PROJECT;
  } catch {
    return DEFAULT_PROJECT;
  }
}

async function analyzeAudioFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  const channel = audioBuffer.getChannelData(0);
  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const windowSize = Math.max(1024, Math.floor(sampleRate * 0.25));
  const energies = [];

  for (let offset = 0; offset < channel.length; offset += windowSize) {
    let sum = 0;
    const end = Math.min(offset + windowSize, channel.length);

    for (let index = offset; index < end; index += 1) {
      sum += Math.abs(channel[index]);
    }

    energies.push(sum / Math.max(end - offset, 1));
  }

  const averageEnergy = energies.reduce((sum, value) => sum + value, 0) / Math.max(energies.length, 1);
  const normalizedEnergy = Math.min(1, Math.max(0.25, averageEnergy * 5));
  const estimatedBpm = normalizedEnergy > 0.68 ? 132 : normalizedEnergy > 0.48 ? 118 : 96;
  const beats = buildFallbackBeats(estimatedBpm, Math.min(64, Math.ceil(duration / (60 / estimatedBpm))));

  context.close?.();

  return {
    status: 'ready',
    fileName: file.name,
    duration: Number(duration.toFixed(2)),
    bpm: estimatedBpm,
    energy: Number(normalizedEnergy.toFixed(2)),
    averageBeatStep: Number((60 / estimatedBpm).toFixed(2)),
    beats
  };
}

function buildFallbackBeats(bpm, count) {
  const step = 60 / bpm;
  return Array.from({ length: count }).map((_, index) => ({
    time: Number((index * step).toFixed(2)),
    energy: Number((0.5 + ((index % 4) * 0.12)).toFixed(2))
  }));
}

function describeAudioAnalysis(audioAnalysis) {
  if (audioAnalysis.status === 'analyzing') {
    return `Analizuję plik ${audioAnalysis.fileName} i przygotowuję siatkę cięć.`;
  }

  if (audioAnalysis.status === 'fallback') {
    return `Używam awaryjnej beat mapy dla ${audioAnalysis.fileName}.`;
  }

  return `Plik ${audioAnalysis.fileName}: długość ${audioAnalysis.duration}s, szacunkowe BPM ${audioAnalysis.bpm}.`;
}
