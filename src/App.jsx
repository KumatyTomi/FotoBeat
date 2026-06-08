import { useMemo, useState } from 'react';
import { CheckCircle2, Download, FileJson, Film, ImagePlus, Music, Play, RefreshCcw, Save, Sparkles, Trash2, Upload, Wand2 } from 'lucide-react';
import EffectCard from './components/EffectCard.jsx';
import FileDropzone from './components/FileDropzone.jsx';
import TimelinePreview from './components/TimelinePreview.jsx';
import WaveformPreview from './components/WaveformPreview.jsx';
import { EFFECT_PRESETS, EXPORT_FORMATS } from './data/effects.js';
import { useAudioAnalysis } from './hooks/useAudioAnalysis.js';
import { useCanvasPreview } from './hooks/useCanvasPreview.js';
import { useCanvasRecorder } from './hooks/useCanvasRecorder.js';
import { useMediaAssets } from './hooks/useMediaAssets.js';
import { useProjectState } from './hooks/useProjectState.js';
import { describeAudioAnalysis } from './utils/audioAnalysis.js';
import { getPinnedLabel, scoreMediaAsset } from './utils/mediaScoring.js';
import { buildProjectExportPayload, parseProjectFile, remapImportedMedia, safeFilename } from './utils/projectExport.js';
import { buildDraftTimeline } from './utils/timeline.js';

export default function App() {
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);

  const {
    project,
    lastSavedAt,
    projectIoStatus,
    setProjectIoStatus,
    patchProject,
    replaceProject,
    addSnapshot: addProjectSnapshot
  } = useProjectState();

  const format = project.format;
  const preset = project.preset;
  const clipDurationScale = project.clipDurationScale ?? 1;
  const selectedFormat = EXPORT_FORMATS.find((item) => item.id === format) ?? EXPORT_FORMATS[1];
  const selectedPreset = EFFECT_PRESETS.find((item) => item.id === preset) ?? EFFECT_PRESETS[0];

  const media = useMediaAssets(images, selectedFormat);
  const audioAnalysis = useAudioAnalysis(audio);

  const timeline = useMemo(() => buildDraftTimeline({
    images: media.selectedMediaAssets,
    audio,
    format,
    preset,
    audioAnalysis,
    clipDurationScale
  }), [media.selectedMediaAssets, audio, format, preset, audioAnalysis, clipDurationScale]);

  const projectExportPayload = useMemo(() => buildProjectExportPayload({
    project,
    timeline,
    mediaAssets: media.mediaAssets,
    selectedMediaAssets: media.selectedMediaAssets,
    selectedAssetIds: media.selectedAssetIds,
    pinnedAssetsByClip: media.pinnedAssetsByClip,
    selectedFormat,
    audio,
    scoreMediaAsset
  }), [audio, media.mediaAssets, media.pinnedAssetsByClip, media.selectedAssetIds, media.selectedMediaAssets, project, selectedFormat, timeline]);

  const projectExportJson = useMemo(() => JSON.stringify(projectExportPayload, null, 2), [projectExportPayload]);
  const projectExportHref = useMemo(() => `data:application/json;charset=utf-8,${encodeURIComponent(projectExportJson)}`, [projectExportJson]);
  const projectExportFilename = `${safeFilename(project.name)}.fotobeat.json`;

  const { previewRef, previewPlayback } = useCanvasPreview({
    timeline,
    selectedFormat,
    selectedPreset,
    selectedMediaAssets: media.selectedMediaAssets,
    pinnedAssetsByClip: media.pinnedAssetsByClip,
    projectName: project.name
  });

  const recorder = useCanvasRecorder({
    canvasRef: previewRef,
    projectName: project.name,
    timelineDuration: timeline.estimatedDuration,
    audioFile: audio
  });

  function addSnapshot() {
    addProjectSnapshot({
      id: `snapshot-${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: `${project.name || 'Projekt'} · ${timeline.clips.length} klipów`,
      format,
      preset,
      notes: project.notes,
      summary: timeline.summary,
      estimatedDuration: timeline.estimatedDuration,
      selectedMediaCount: media.selectedMediaAssets.length,
      pinnedClipCount: Object.keys(media.pinnedAssetsByClip).length,
      clipDurationScale
    });
  }

  function copyProjectJson() {
    navigator.clipboard?.writeText(projectExportJson);
    setProjectIoStatus({ type: 'success', message: 'Projekt JSON skopiowany do schowka.' });
  }

  async function importProjectFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseProjectFile(text);
      const remapped = remapImportedMedia(imported.media, media.mediaAssets);

      replaceProject(imported.project);

      if (remapped.selectedOrder.length) {
        media.setSelectedAssetIds(remapped.selectedOrder);
      }

      media.setPinnedAssetsByClip(remapped.pinnedAssetsByClip);
      setProjectIoStatus({
        type: 'success',
        message: `Zaimportowano projekt. Dopasowano ${remapped.selectedOrder.length}/${imported.media?.selectedImages?.length ?? 0} mediów.`
      });
    } catch (error) {
      setProjectIoStatus({ type: 'error', message: error.message || 'Nie udało się zaimportować projektu.' });
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={18} />FotoBeat.me · AI video editor</div>
          <h1>Zdjęcia + muzyka = klip zsynchronizowany z beatem.</h1>
          <p>Wrzuć zdjęcia i MP3. Prototyp buduje timeline, analizuje audio, pokazuje waveform i pozwala korygować tempo klipów.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#upload"><Wand2 size={18} />Zbuduj projekt</a>
            <a className="ghost-button" href="#preview"><Play size={18} />Render preview</a>
          </div>
        </div>
        <div className="preview-card">
          <div className="orb orb-a" /><div className="orb orb-b" />
          <div className="mock-video-frame"><span>FotoBeat</span><strong>{selectedFormat?.label}</strong><em>{selectedPreset?.name}</em></div>
        </div>
      </section>

      <section id="project" className="project-panel">
        <div className="section-heading project-heading">
          <div>
            <p className="panel-kicker">Projekt</p>
            <h2>Autosave, snapshoty, import i eksport</h2>
            <p>Stan projektu zapisuje się automatycznie. Możesz pobrać `.fotobeat.json`, skopiować JSON lub zaimportować projekt.</p>
          </div>
          <span className="autosave-pill"><Save size={15} />{lastSavedAt ? `Zapisano: ${new Date(lastSavedAt).toLocaleString('pl-PL')}` : 'Jeszcze nie zapisano'}</span>
        </div>
        <div className="project-grid">
          <label className="field-block">Nazwa projektu<input value={project.name} onChange={(event) => patchProject({ name: event.target.value })} placeholder="Nazwa projektu" /></label>
          <label className="field-block">Notatki kreatywne<textarea value={project.notes} onChange={(event) => patchProject({ notes: event.target.value })} placeholder="Np. klub, neon, szybkie cięcia, drop po 12 sekundzie..." /></label>
          <div className="project-actions">
            <button className="primary-button compact" onClick={addSnapshot}><FileJson size={16} />Zrób snapshot</button>
            <a className="ghost-button compact" href={projectExportHref} download={projectExportFilename}><Download size={16} />Pobierz JSON</a>
            <button className="ghost-button compact" onClick={copyProjectJson}><FileJson size={16} />Kopiuj JSON</button>
            <label className="ghost-button compact import-project-button"><Upload size={16} />Import JSON<input type="file" accept="application/json,.json,.fotobeat.json" onChange={importProjectFile} /></label>
          </div>
        </div>
        {projectIoStatus.message && <p className={projectIoStatus.type === 'error' ? 'io-status error' : 'io-status success'}>{projectIoStatus.message}</p>}
        <div className="snapshot-list">
          {project.snapshots.length === 0 ? <span className="empty-state">Brak snapshotów. Zapisz pierwszy wariant timeline.</span> : project.snapshots.map((snapshot) => (
            <article key={snapshot.id} className="snapshot-card"><strong>{snapshot.name}</strong><span>{new Date(snapshot.createdAt).toLocaleString('pl-PL')}</span><em>{snapshot.format} · {snapshot.preset} · {snapshot.estimatedDuration}s</em></article>
          ))}
        </div>
      </section>

      <section id="preview" className="render-preview-panel">
        <div className="section-heading project-heading">
          <div><p className="panel-kicker">Render preview</p><h2>Canvas pod realne kadry, timeline i beat</h2><p>Canvas używa wybranych zdjęć, formatu eksportu, presetu, energii klipu i czasu odtwarzania.</p></div>
          <div className="preview-hud"><span>{selectedFormat.width}×{selectedFormat.height}</span><span>{previewPlayback.time}s</span><span>Klip {previewPlayback.clipIndex}/{timeline.clips.length}</span><span>{media.selectedMediaAssets.length} kadrów</span><span>Tempo ×{clipDurationScale}</span></div>
        </div>
        <div className={`canvas-shell canvas-${selectedFormat.id}`}><canvas ref={previewRef} width={selectedFormat.width} height={selectedFormat.height} aria-label="Animowany podgląd renderu FotoBeat" /></div>
      </section>

      <section className="render-export-panel">
        <div>
          <p className="panel-kicker">Render queue</p>
          <h2>Eksport WebM {audio ? 'z audio' : 'bez audio'}</h2>
          <p>{audio ? 'MediaRecorder połączy obraz z canvas i ścieżkę audio z Web Audio API.' : 'Dodaj MP3/WAV, aby eksport WebM zawierał także ścieżkę audio.'}</p>
        </div>
        <div className="render-export-actions">
          <button className="primary-button compact" onClick={recorder.startRecording} disabled={recorder.recordingState.status === 'recording' || recorder.recordingState.status === 'preparing'}>
            <Film size={16} />
            {recorder.recordingState.status === 'recording' ? 'Nagrywanie...' : `Nagraj ${recorder.maxDuration}s WebM`}
          </button>
          {recorder.exportHistory.length > 0 && (
            <button className="ghost-button compact" onClick={recorder.clearExportHistory}>
              <Trash2 size={16} />Wyczyść historię
            </button>
          )}
        </div>
        <p className={`render-status ${recorder.recordingState.status}`}>{recorder.recordingState.message}</p>
        <div className="render-history">
          {recorder.exportHistory.length === 0 ? (
            <span className="empty-state">Brak eksportów. Nagraj pierwszy plik WebM, a pojawi się tutaj jako element kolejki.</span>
          ) : recorder.exportHistory.map((item) => (
            <article key={item.id} className="render-history-item">
              <div>
                <strong>{item.fileName}</strong>
                <span>{new Date(item.createdAt).toLocaleString('pl-PL')} · {item.duration}s · {formatBytes(item.size)} · {item.hasAudio ? 'audio + video' : 'video only'}</span>
              </div>
              <div className="render-history-actions">
                <a className="ghost-button compact" href={item.downloadUrl} download={item.fileName}><Download size={16} />Pobierz</a>
                <button className="ghost-button compact" onClick={() => recorder.removeExport(item.id)}><Trash2 size={16} />Usuń</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="upload" className="workspace-grid">
        <FileDropzone icon={<ImagePlus />} title="Zdjęcia" description="JPG, PNG, WEBP. Możesz wrzucić całą paczkę kadrów." accept="image/*" multiple files={images} onFiles={setImages} />
        <FileDropzone icon={<Music />} title="Muzyka" description="MP3/WAV. Jeden plik audio do synchronizacji montażu." accept="audio/*" multiple={false} files={audio ? [audio] : []} onFiles={(next) => setAudio(next[0] ?? null)} />
      </section>

      <section className="audio-panel waveform-panel">
        <div>
          <p className="panel-kicker">Waveform + beat grid</p>
          <h2>Analiza utworu i korekta tempa klipów</h2>
          <p>{audioAnalysis ? describeAudioAnalysis(audioAnalysis) : 'Wrzuć audio, aby wygenerować waveform, beat mapę i szacunkowe BPM.'}</p>
          <label className="range-control">Korekta długości klipów: ×{clipDurationScale}
            <input type="range" min="0.5" max="2" step="0.05" value={clipDurationScale} onChange={(event) => patchProject({ clipDurationScale: Number(event.target.value) })} />
          </label>
        </div>
        <div className="audio-stats"><span>BPM: {audioAnalysis?.bpm ?? '—'}</span><span>Energia: {audioAnalysis ? `${Math.round(audioAnalysis.energy * 100)}%` : '—'}</span><span>Beatów: {audioAnalysis?.beats?.length ?? 0}</span></div>
        <WaveformPreview analysis={audioAnalysis} durationScale={clipDurationScale} />
      </section>

      <section className="media-panel">
        <div className="section-heading project-heading">
          <div><p className="panel-kicker">Timeline control</p><h2>Kolejność, scoring i przypięcia kadrów</h2><p>Zaznacz aktywne zdjęcia, ustaw kolejność i przypnij wybrane zdjęcie do aktualnego klipu.</p></div>
          <div className="preview-hud"><span>{media.mediaAssets.length} plików</span><span>{media.selectedMediaAssets.length} aktywnych</span><span>{Object.keys(media.pinnedAssetsByClip).length} przypięć</span>{media.mediaAssets.length > 0 && <button className="ghost-button compact" onClick={media.selectAllMedia}>Zaznacz wszystko</button>}{media.pinnedAssetsByClip[previewPlayback.clipIndex] && <button className="ghost-button compact" onClick={() => media.clearPinnedClip(previewPlayback.clipIndex)}>Odepnij klip {previewPlayback.clipIndex}</button>}</div>
        </div>
        {media.mediaAssets.length === 0 ? <span className="empty-state">Wrzuć zdjęcia, a tutaj pojawią się miniatury, scoring, orientacja i kontrola timeline.</span> : (
          <div className="media-grid">{media.scoredMediaAssets.map((asset) => {
            const selected = media.selectedAssetIds.includes(asset.id);
            const activeIndex = media.selectedAssetIds.indexOf(asset.id);
            const pinnedLabel = getPinnedLabel(asset.id, media.pinnedAssetsByClip);
            return <article key={asset.id} className={selected ? 'media-card selected' : 'media-card'}>
              <button className="media-thumb-button" onClick={() => media.toggleMediaAsset(asset.id)}><span className="media-thumb"><img src={asset.url} alt={asset.name} />{selected && <i><CheckCircle2 size={18} /></i>}</span></button>
              <strong>{asset.name}</strong><em>{asset.status} · {asset.orientation} · {asset.width || '—'}×{asset.height || '—'}</em>
              <div className="score-row"><span>Score {asset.score}</span>{selected && <span>#{activeIndex + 1}</span>}{pinnedLabel && <span>{pinnedLabel}</span>}</div>
              <div className="media-actions"><button onClick={() => media.moveMediaAsset(asset.id, -1)} disabled={!selected || activeIndex <= 0}>↑</button><button onClick={() => media.moveMediaAsset(asset.id, 1)} disabled={!selected || activeIndex === media.selectedAssetIds.length - 1}>↓</button><button onClick={() => media.pinAssetToClip(asset.id, previewPlayback.clipIndex)} disabled={!selected}>Przypnij</button></div>
            </article>;
          })}</div>
        )}
      </section>

      <section className="control-panel">
        <div><h2>Format eksportu</h2><div className="button-row">{EXPORT_FORMATS.map((item) => <button key={item.id} className={format === item.id ? 'chip active' : 'chip'} onClick={() => patchProject({ format: item.id })}>{item.label}</button>)}</div></div>
        <div><h2>Preset efektów</h2><div className="preset-grid">{EFFECT_PRESETS.map((item) => <EffectCard key={item.id} effect={item} active={preset === item.id} onClick={() => patchProject({ preset: item.id })} />)}</div></div>
      </section>

      <TimelinePreview timeline={timeline} />
      <section id="roadmap" className="roadmap-panel"><div><h2>Następne moduły</h2><p>Kolejne kroki: persistent render history, realniejsza detekcja transientów i MP4 przez ffmpeg.wasm.</p></div><div className="roadmap-list"><span><RefreshCcw size={16} /> Autosave + snapshots</span><span><Film size={16} /> Render queue</span><span><Download size={16} /> Paczki eksportowe ZIP</span></div></section>
    </main>
  );
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
