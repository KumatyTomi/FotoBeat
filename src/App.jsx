import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Music, Sparkles, Wand2, Film, Download, RefreshCcw, Save, FileJson, Play } from 'lucide-react';
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
  const [previewPlayback, setPreviewPlayback] = useState({ time: 0, clipIndex: 1 });
  const previewRef = useRef(null);

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

  const selectedFormat = EXPORT_FORMATS.find((item) => item.id === format) ?? EXPORT_FORMATS[1];
  const selectedPreset = EFFECT_PRESETS.find((item) => item.id === preset) ?? EFFECT_PRESETS[0];

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return undefined;

    let frameId;
    let lastHudUpdate = 0;
    const startedAt = performance.now();

    function frame(now) {
      const totalDuration = Math.max(timeline.estimatedDuration || 1, 1);
      const time = ((now - startedAt) / 1000) % totalDuration;
      const clip = findClipAtTime(timeline.clips, time);
      const clipIndex = Math.max(1, timeline.clips.indexOf(clip) + 1);

      drawRenderPreview(canvas, {
        time,
        clip,
        clipIndex,
        totalClips: timeline.clips.length,
        format: selectedFormat,
        preset: selectedPreset,
        imageCount: images.length,
        projectName: project.name
      });

      if (now - lastHudUpdate > 220) {
        setPreviewPlayback({ time: Number(time.toFixed(1)), clipIndex });
        lastHudUpdate = now;
      }

      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [images.length, project.name, selectedFormat, selectedPreset, timeline]);

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
            Wrzuć zdjęcia i MP3. Prototyp buduje roboczy timeline, analizuje energię audio,
            rysuje animowany canvas preview i zapisuje stan projektu lokalnie pod dalszy render.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#upload">
              <Wand2 size={18} />
              Zbuduj projekt
            </a>
            <a className="ghost-button" href="#preview">
              <Play size={18} />
              Render preview
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

      <section id="preview" className="render-preview-panel">
        <div className="section-heading project-heading">
          <div>
            <p className="panel-kicker">Render preview</p>
            <h2>Canvas pod timeline i beat</h2>
            <p>
              To jest pierwszy most do prawdziwego renderu MP4: canvas używa formatu eksportu,
              presetu, energii klipu, sekcji timeline i czasu odtwarzania.
            </p>
          </div>
          <div className="preview-hud">
            <span>{selectedFormat.width}×{selectedFormat.height}</span>
            <span>{previewPlayback.time}s</span>
            <span>Klip {previewPlayback.clipIndex}/{timeline.clips.length}</span>
          </div>
        </div>

        <div className={`canvas-shell canvas-${selectedFormat.id}`}>
          <canvas
            ref={previewRef}
            width={selectedFormat.width}
            height={selectedFormat.height}
            aria-label="Animowany podgląd renderu FotoBeat"
          />
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
            Ten frontend jest bazą pod Base44/Vite. Kolejne kroki: render preview na realnych miniaturach,
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

function findClipAtTime(clips, time) {
  return [...clips].reverse().find((clip) => time >= clip.start) ?? clips[0];
}

function drawRenderPreview(canvas, { time, clip, clipIndex, totalClips, format, preset, imageCount, projectName }) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const progress = getClipProgress(clip, time);
  const pulse = Math.sin(progress * Math.PI);
  const energy = clip?.energy ?? 0.5;
  const colors = getPresetColors(preset.id);

  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#05050a');
  background.addColorStop(0.45, colors.deep);
  background.addColorStop(1, '#10101f');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  drawGlow(ctx, width * (0.28 + pulse * 0.12), height * 0.22, width * 0.38, colors.primary, 0.45 + energy * 0.28);
  drawGlow(ctx, width * (0.74 - pulse * 0.08), height * 0.76, width * 0.44, colors.secondary, 0.25 + energy * 0.22);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(getPresetRotation(preset.id, progress, energy));
  ctx.scale(1 + pulse * 0.035 + energy * 0.018, 1 + pulse * 0.035 + energy * 0.018);
  drawFrameStack(ctx, width, height, colors, clipIndex, imageCount, progress);
  ctx.restore();

  drawScanlines(ctx, width, height, preset.id, progress);
  drawPreviewText(ctx, width, height, {
    projectName,
    clip,
    clipIndex,
    totalClips,
    preset,
    format,
    progress,
    colors
  });
}

function getClipProgress(clip, time) {
  if (!clip) return 0;
  return Math.min(1, Math.max(0, (time - clip.start) / Math.max(clip.duration, 0.1)));
}

function getPresetColors(presetId) {
  const map = {
    neonPulse: { primary: '#00d3ff', secondary: '#7c3cff', deep: '#10103a' },
    smokeCut: { primary: '#c8d0ff', secondary: '#6d7188', deep: '#171927' },
    matrixGlitch: { primary: '#6cff8d', secondary: '#00d3ff', deep: '#061b13' },
    sinCity: { primary: '#ff3b5c', secondary: '#f4f4f4', deep: '#17080c' },
    spiralZoom: { primary: '#ffb86b', secondary: '#7c3cff', deep: '#1c102f' },
    dreamFade: { primary: '#ffd6f2', secondary: '#8be9ff', deep: '#171429' }
  };

  return map[presetId] ?? map.neonPulse;
}

function getPresetRotation(presetId, progress, energy) {
  if (presetId === 'spiralZoom') return progress * 0.16;
  if (presetId === 'matrixGlitch') return Math.sin(progress * 24) * 0.006 * energy;
  if (presetId === 'dreamFade') return Math.sin(progress * Math.PI) * 0.01;
  return Math.sin(progress * Math.PI * 2) * 0.018 * energy;
}

function drawGlow(ctx, x, y, radius, color, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, hexToRgba(color, alpha));
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawFrameStack(ctx, width, height, colors, clipIndex, imageCount, progress) {
  const frameCount = 5;
  const baseWidth = width * 0.58;
  const baseHeight = height * 0.58;

  for (let index = frameCount - 1; index >= 0; index -= 1) {
    const offset = (index - 2) * width * 0.025;
    const lift = Math.sin(progress * Math.PI + index) * height * 0.012;
    const alpha = 0.18 + (frameCount - index) * 0.08;

    ctx.fillStyle = index % 2 === 0 ? hexToRgba(colors.primary, alpha) : hexToRgba(colors.secondary, alpha);
    ctx.strokeStyle = hexToRgba('#ffffff', 0.16 + alpha * 0.22);
    ctx.lineWidth = Math.max(2, width * 0.002);
    roundRect(ctx, -baseWidth / 2 + offset, -baseHeight / 2 + lift, baseWidth, baseHeight, width * 0.025);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.font = `700 ${Math.max(26, width * 0.028)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(imageCount ? `PHOTO ${clipIndex}` : 'DROP PHOTOS', 0, 0);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
  ctx.font = `500 ${Math.max(18, width * 0.016)}px Inter, sans-serif`;
  ctx.fillText(imageCount ? `${imageCount} plików w projekcie` : 'upload zdjęć aktywuje prawdziwe kadry', 0, height * 0.045);
}

function drawScanlines(ctx, width, height, presetId, progress) {
  if (presetId !== 'matrixGlitch' && presetId !== 'sinCity') return;

  ctx.save();
  ctx.globalAlpha = presetId === 'matrixGlitch' ? 0.18 : 0.08;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;

  const gap = Math.max(12, height * 0.012);
  const shift = progress * gap * 2;
  for (let y = -gap; y < height + gap; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y + shift);
    ctx.lineTo(width, y + shift);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPreviewText(ctx, width, height, { projectName, clip, clipIndex, totalClips, preset, format, colors }) {
  const margin = width * 0.06;
  const bottom = height - margin;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.font = `800 ${Math.max(24, width * 0.025)}px Inter, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(projectName || 'FotoBeat Project', margin, margin * 1.25);

  ctx.fillStyle = hexToRgba(colors.primary, 0.92);
  ctx.font = `900 ${Math.max(16, width * 0.014)}px Inter, sans-serif`;
  ctx.fillText(`${preset.name} · ${format.label}`, margin, margin * 1.75);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.font = `700 ${Math.max(18, width * 0.017)}px Inter, sans-serif`;
  ctx.fillText(`Clip ${clipIndex}/${totalClips} · ${clip?.section ?? 'intro'} · ${clip?.effect ?? 'fade'}`, margin, bottom);

  ctx.textAlign = 'right';
  ctx.fillText('FotoBeat.me', width - margin, bottom);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
