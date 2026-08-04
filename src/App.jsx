import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileJson, Film, ImagePlus, Monitor, Music, Play, RefreshCcw, Save, Sparkles, Trash2, Upload, Wand2 } from 'lucide-react';
import DesktopRenderPanel from './components/DesktopRenderPanel.jsx';
import EffectCard from './components/EffectCard.jsx';
import FileDropzone from './components/FileDropzone.jsx';
import TimelinePreview from './components/TimelinePreview.jsx';
import WaveformPreview from './components/WaveformPreview.jsx';
import { EFFECT_PRESETS, EXPORT_FORMATS } from './data/effects.js';
import { useAudioAnalysis } from './hooks/useAudioAnalysis.js';
import { useCanvasPreview } from './hooks/useCanvasPreview.js';
import { useCanvasRecorder } from './hooks/useCanvasRecorder.js';
import { useDesktopBridge } from './hooks/useDesktopBridge.js';
import { useFrameExporter } from './hooks/useFrameExporter.js';
import { useFrameSequenceRenderer } from './hooks/useFrameSequenceRenderer.js';
import { useFrameSequenceZipExporter } from './hooks/useFrameSequenceZipExporter.js';
import { useMediaAssets } from './hooks/useMediaAssets.js';
import { useMp4Exporter } from './hooks/useMp4Exporter.js';
import { useProjectState } from './hooks/useProjectState.js';
import { useRenderJobs } from './hooks/useRenderJobs.js';
import { describeAudioAnalysis } from './utils/audioAnalysis.js';
import { getPinnedLabel, scoreMediaAsset } from './utils/mediaScoring.js';
import { DEFAULT_FRAME_SEQUENCE_PRESET_ID, FRAME_SEQUENCE_PRESETS, describeFrameSequenceSettings, getFrameSequencePreset } from './utils/frameSequenceSettings.js';
import { buildExportHubPlan, describeExportHubAction } from './utils/exportHub.js';
import { buildMp4ExportPlan, explainMp4ExportPlan } from './utils/mp4ExportPlan.js';
import { buildImportedMediaReport, buildProjectExportPayload, parseProjectFile, remapImportedMedia, safeFilename } from './utils/projectExport.js';
import { buildDraftTimeline } from './utils/timeline.js';

export default function App() {
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [mp4Plan, setMp4Plan] = useState(null);
  const [frameSequencePresetId, setFrameSequencePresetId] = useState(DEFAULT_FRAME_SEQUENCE_PRESET_ID);
  const [importedMediaManifest, setImportedMediaManifest] = useState(null);

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
  const renderJobs = useRenderJobs();
  const mp4Exporter = useMp4Exporter();
  const desktop = useDesktopBridge();

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
  const importedMediaReport = useMemo(() => (
    importedMediaManifest ? buildImportedMediaReport(importedMediaManifest, media.mediaAssets) : null
  ), [importedMediaManifest, media.mediaAssets]);

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

  const frameExporter = useFrameExporter({
    canvasRef: previewRef,
    projectName: project.name,
    timeline,
    selectedFormat,
    selectedPreset,
    selectedMediaAssets: media.selectedMediaAssets,
    pinnedAssetsByClip: media.pinnedAssetsByClip
  });

  const frameSequence = useFrameSequenceRenderer({
    canvasRef: previewRef,
    projectName: project.name,
    timeline,
    selectedFormat,
    selectedPreset,
    selectedMediaAssets: media.selectedMediaAssets,
    pinnedAssetsByClip: media.pinnedAssetsByClip
  });

  const frameZip = useFrameSequenceZipExporter();
  const selectedFrameSequencePreset = getFrameSequencePreset(frameSequencePresetId);
  const selectedFrameSequenceSummary = describeFrameSequenceSettings(selectedFrameSequencePreset);

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

  async function createMp4Plan(sequence, includeAudio = false) {
    const audioFile = includeAudio ? audio : null;
    const plan = buildMp4ExportPlan({
      sequence,
      audioFile,
      profileId: audioFile ? 'mp4-audio-poc' : 'mp4-poc'
    });
    setMp4Plan(plan);
    await renderJobs.addMp4PlanJob({
      projectName: project.name,
      format,
      preset,
      timelineDuration: timeline.estimatedDuration,
      sequenceId: sequence.id,
      plan
    });
  }

  async function createMp4Poc(sequence, includeAudio = false) {
    const audioFile = includeAudio ? audio : null;
    const plan = buildMp4ExportPlan({
      sequence,
      audioFile,
      profileId: audioFile ? 'mp4-audio-poc' : 'mp4-poc'
    });
    setMp4Plan(plan);
    if (plan.status !== 'blocked') {
      await renderJobs.addMp4PlanJob({
        projectName: project.name,
        format,
        preset,
        timelineDuration: timeline.estimatedDuration,
        sequenceId: sequence.id,
        plan
      });
    }
    await mp4Exporter.exportSequenceToMp4(sequence, audioFile);
  }

  async function createZip(sequence) {
    await frameZip.exportSequenceZip(sequence);
    await renderJobs.addSequenceZipJob({
      projectName: project.name,
      format,
      preset,
      timelineDuration: timeline.estimatedDuration,
      sequenceId: sequence.id
    });
  }

  async function renderSelectedFrameSequence() {
    await frameSequence.renderSequence({
      presetId: selectedFrameSequencePreset.id,
      seconds: selectedFrameSequencePreset.seconds,
      fps: selectedFrameSequencePreset.fps
    });
  }

  async function createDesktopRenderJob(sequence = null) {
    const payload = {
      manifest: {
        schemaVersion: 'fotobeat.desktop.render.v1',
        project: projectExportPayload.project,
        media: projectExportPayload.media,
        timeline: projectExportPayload.timeline,
        format: selectedFormat,
        preset: selectedPreset,
        audio: audio ? { name: audio.name, size: audio.size, type: audio.type } : null,
        sequence: sequence ? {
          id: sequence.id,
          frameCount: sequence.frameCount,
          fps: sequence.fps,
          seconds: sequence.seconds,
          width: sequence.width,
          height: sequence.height,
          totalSize: sequence.totalSize
        } : null
      }
    };

    if (sequence) {
      await desktop.createLocalRenderJobFromSequence(payload, sequence, audio);
      return;
    }

    await desktop.createLocalRenderJob(payload);
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
      setImportedMediaManifest(imported.media ?? null);

      if (remapped.selectedOrder.length) {
        media.setSelectedAssetIds(remapped.selectedOrder);
      }

      media.setPinnedAssetsByClip(remapped.pinnedAssetsByClip);
      setProjectIoStatus({
        type: 'success',
        message: remapped.report.missingImageCount
          ? `Zaimportowano projekt. Dopasowano ${remapped.report.matchedImageCount}/${remapped.report.expectedImageCount} mediów; brakuje ${remapped.report.missingImageCount}.`
          : `Zaimportowano projekt. Dopasowano ${remapped.report.matchedImageCount}/${remapped.report.expectedImageCount} mediów.`
      });
    } catch (error) {
      setProjectIoStatus({ type: 'error', message: error.message || 'Nie udało się zaimportować projektu.' });
    }
  }

  const mp4Busy = ['loading', 'preparing', 'encoding'].includes(mp4Exporter.mp4State.status);
  const canMuxAudio = Boolean(audio);
  const webmBusy = ['recording', 'preparing'].includes(recorder.recordingState.status);
  const latestSequence = frameSequence.sequenceHistory[0] ?? null;
  const exportHub = buildExportHubPlan({
    sequences: frameSequence.sequenceHistory,
    desktopAvailable: desktop.available,
    ffmpegReady: desktop.ffmpegReady,
    mp4Busy,
    zipBusy: frameZip.zipState.status === 'building',
    webmBusy,
    audioAvailable: canMuxAudio
  });

  async function runExportHubAction(actionId = exportHub.recommended?.id) {
    const sequence = exportHub.latestSequence ?? latestSequence;
    if (actionId === 'native-mp4' && sequence) return createDesktopRenderJob(sequence);
    if (actionId === 'mp4-poc' && sequence) return createMp4Poc(sequence, canMuxAudio);
    if (actionId === 'webm') return recorder.startRecording();
    if (actionId === 'zip-frames' && sequence) return createZip(sequence);
    return null;
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={18} />FotoBeat Desktop · local-first renderer</div>
          <h1>Lokalny montaż zdjęć i muzyki pod beat.</h1>
          <p>Wrzuć zdjęcia i MP3 bez chmury. Desktop buduje timeline, analizuje audio, pokazuje waveform i przygotowuje lokalny render na dysku.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#upload"><Wand2 size={18} />Zbuduj lokalny projekt</a>
            <a className="ghost-button" href="#preview"><Play size={18} />Podgląd renderu</a>
          </div>
        </div>
        <div className="preview-card">
          <div className="orb orb-a" /><div className="orb orb-b" />
          <div className="mock-video-frame"><span>FotoBeat Desktop</span><strong>{selectedFormat?.label}</strong><em>{selectedPreset?.name}</em></div>
        </div>
      </section>

      <section id="project" className="project-panel">
        <div className="section-heading project-heading">
          <div>
            <p className="panel-kicker">Lokalny projekt</p>
            <h2>Autosave, snapshoty, import i eksport bez backendu</h2>
            <p>Stan projektu zapisuje się lokalnie. Możesz pobrać `.fotobeat.json`, skopiować JSON lub przenieść projekt między komputerami przez import.</p>
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
        {importedMediaReport && (importedMediaReport.expectedImageCount > 0 || importedMediaReport.missingPinnedClips.length > 0) && (
          <ImportedMediaReportPanel report={importedMediaReport} />
        )}
        <div className="snapshot-list">
          {project.snapshots.length === 0 ? <span className="empty-state">Brak snapshotów. Zapisz pierwszy wariant timeline.</span> : project.snapshots.map((snapshot) => (
            <article key={snapshot.id} className="snapshot-card"><strong>{snapshot.name}</strong><span>{new Date(snapshot.createdAt).toLocaleString('pl-PL')}</span><em>{snapshot.format} · {snapshot.preset} · {snapshot.estimatedDuration}s</em></article>
          ))}
        </div>
      </section>

      <section id="preview" className="render-preview-panel">
        <div className="section-heading project-heading">
          <div><p className="panel-kicker">Canvas preview</p><h2>Lokalny podgląd kadrów, timeline i beatów</h2><p>Canvas używa wybranych zdjęć, formatu eksportu, presetu, energii klipu i czasu odtwarzania — wszystko bez wysyłania plików na serwer.</p></div>
          <div className="preview-hud"><span>{selectedFormat.width}×{selectedFormat.height}</span><span>{previewPlayback.time}s</span><span>Klip {previewPlayback.clipIndex}/{timeline.clips.length}</span><span>{media.selectedMediaAssets.length} kadrów</span><span>Tempo ×{clipDurationScale}</span></div>
        </div>
        <div className={`canvas-shell canvas-${selectedFormat.id}`}><canvas ref={previewRef} width={selectedFormat.width} height={selectedFormat.height} aria-label="Animowany podgląd renderu FotoBeat" /></div>
        <div className="frame-export-actions">
          <button className="ghost-button compact" onClick={() => frameExporter.exportFrameAtTime(previewPlayback.time)}>
            <Download size={16} />Eksportuj klatkę PNG
          </button>
          <button className="ghost-button compact" onClick={() => frameExporter.generateCoverFrame(previewPlayback.time)}>
            <ImagePlus size={16} />Generuj cover
          </button>
          {frameExporter.frameExport.downloadHref && (
            <a className="ghost-button compact" href={frameExporter.frameExport.downloadHref} download={frameExporter.frameExport.fileName}>
              <Download size={16} />Pobierz PNG
            </a>
          )}
          {frameExporter.coverExport.downloadHref && (
            <a className="ghost-button compact" href={frameExporter.coverExport.downloadHref} download={frameExporter.coverExport.fileName}>
              <Download size={16} />Pobierz cover
            </a>
          )}
          {frameExporter.frameExport.downloadHref && (
            <button className="ghost-button compact" onClick={frameExporter.clearFrameExport}>Wyczyść PNG</button>
          )}
          {frameExporter.coverExport.downloadHref && (
            <button className="ghost-button compact" onClick={frameExporter.clearCoverExport}>Wyczyść cover</button>
          )}
        </div>
        <p className={`frame-export-status ${frameExporter.frameExport.status}`}>{frameExporter.frameExport.message}</p>
        <p className={`frame-export-status ${frameExporter.coverExport.status}`}>{frameExporter.coverExport.message}</p>
      </section>

      <DesktopRenderPanel desktop={desktop} onCreateDesktopRenderJob={createDesktopRenderJob} />

      <section className="render-export-panel">
        <div>
          <p className="panel-kicker">Export Hub</p>
          <h2>Najlepsza ścieżka eksportu</h2>
          <p>{exportHub.summary}</p>
        </div>
        <div className="render-export-actions">
          <button className="primary-button compact" onClick={() => runExportHubAction()} disabled={!exportHub.recommended}>
            <CheckCircle2 size={16} />Uruchom rekomendację
          </button>
        </div>
        <div className="render-history">
          {exportHub.actions.map((action) => (
            <article key={action.id} className="render-history-item">
              <div>
                <strong>{action.priority}. {action.label} · {action.ready ? 'gotowe' : 'zablokowane'}</strong>
                <span>{describeExportHubAction(action)}</span>
              </div>
              <div className="render-history-actions">
                <button className={action.id === exportHub.recommended?.id ? 'primary-button compact' : 'ghost-button compact'} onClick={() => runExportHubAction(action.id)} disabled={!action.ready}>
                  <Film size={16} />Wybierz
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="render-export-panel">
        <div>
          <p className="panel-kicker">Frame sequence</p>
          <h2>Lokalna sekwencja PNG pod MP4</h2>
          <p>Render do IndexedDB: maksymalnie {frameSequence.limits.maxSeconds}s @ {frameSequence.limits.maxFps} fps i {frameSequence.limits.maxFrameCount} klatek. ZIP używa nazw `frames/frame_0001.png` gotowych pod lokalny FFmpeg.</p>
          <div className="sequence-preset-row" role="group" aria-label="Preset sekwencji PNG">
            {FRAME_SEQUENCE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={frameSequencePresetId === preset.id ? 'sequence-preset-button active' : 'sequence-preset-button'}
                onClick={() => setFrameSequencePresetId(preset.id)}
                disabled={frameSequence.sequenceState.status === 'rendering'}
              >
                <strong>{preset.label}</strong>
                <span>{preset.description}</span>
              </button>
            ))}
          </div>
          <p className="sequence-preset-summary">Wybrano: {selectedFrameSequenceSummary}</p>
        </div>
        <div className="render-export-actions">
          <button className="primary-button compact" onClick={renderSelectedFrameSequence} disabled={frameSequence.sequenceState.status === 'rendering'}>
            <Film size={16} />Renderuj preset
          </button>
          {frameSequence.sequenceState.status === 'rendering' && (
            <button className="ghost-button compact" onClick={frameSequence.cancelSequenceRender}>Przerwij</button>
          )}
          {frameSequence.sequenceHistory.length > 0 && (
            <button className="ghost-button compact" onClick={frameSequence.clearSequences}><Trash2 size={16} />Wyczyść sekwencje</button>
          )}
        </div>
        <div className="sequence-progress" aria-label="Postęp renderu sekwencji">
          <span style={{ width: `${frameSequence.sequenceState.progress}%` }} />
        </div>
        <p className={`render-status ${frameSequence.sequenceState.status}`}>{frameSequence.sequenceState.message}</p>
        <p className={`render-status ${frameZip.zipState.status}`}>{frameZip.zipState.message}{frameZip.zipState.size ? ` · ${formatBytes(frameZip.zipState.size)}` : ''}</p>
        {mp4Plan && <p className={`render-status ${mp4Plan.status === 'blocked' ? 'error' : 'ready'}`}>{explainMp4ExportPlan(mp4Plan)}</p>}
        <div className="render-history">
          {frameSequence.sequenceHistory.length === 0 ? (
            <span className="empty-state">Brak zapisanych sekwencji. Wyrenderuj pierwszą serię PNG, aby przygotować materiał pod lokalny FFmpeg.</span>
          ) : frameSequence.sequenceHistory.map((sequence) => (
            <article key={sequence.id} className="render-history-item">
              <div>
                <strong>{sequence.projectName} · {sequence.frameCount} klatek</strong>
                <span>{new Date(sequence.createdAt).toLocaleString('pl-PL')} · {sequence.seconds}s · {sequence.fps} fps · {sequence.width}×{sequence.height} · {formatBytes(sequence.totalSize)}</span>
              </div>
              <div className="render-history-actions">
                <button className="ghost-button compact" onClick={() => createZip(sequence)} disabled={frameZip.zipState.status === 'building'}><Download size={16} />Spakuj ZIP</button>
                {frameZip.zipState.sequenceId === sequence.id && frameZip.zipState.downloadUrl && (
                  <a className="ghost-button compact" href={frameZip.zipState.downloadUrl} download={frameZip.zipState.fileName}><Download size={16} />Pobierz ZIP</a>
                )}
                <button className="ghost-button compact" onClick={() => createMp4Plan(sequence, false)}><Film size={16} />Plan MP4</button>
                {canMuxAudio && <button className="ghost-button compact" onClick={() => createMp4Plan(sequence, true)}><Music size={16} />Plan + audio</button>}
                <button className="ghost-button compact" onClick={() => createMp4Poc(sequence, false)} disabled={mp4Busy}><Film size={16} />MP4 bez audio</button>
                <button className="ghost-button compact" onClick={() => createMp4Poc(sequence, true)} disabled={mp4Busy || !canMuxAudio}><Music size={16} />MP4 + audio</button>
                <button className="primary-button compact" onClick={() => createDesktopRenderJob(sequence)} disabled={!desktop.available || !desktop.ffmpegReady}><Monitor size={16} />Desktop MP4</button>
                <button className="ghost-button compact" onClick={() => frameSequence.removeSequence(sequence.id)}><Trash2 size={16} />Usuń</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="render-export-panel">
        <div>
          <p className="panel-kicker">MP4 proof of concept</p>
          <h2>ffmpeg.wasm MP4 z opcjonalnym audio</h2>
          <p>{audio ? `Eksport MP4 może połączyć zapisaną sekwencję PNG z lokalnym audio: ${audio.name}.` : 'Eksport MP4 działa bez audio. Dodaj MP3/WAV, aby odblokować wariant MP4 + audio.'}</p>
        </div>
        <div className="render-export-actions">
          {mp4Exporter.mp4Exports.length > 0 && <button className="ghost-button compact" onClick={mp4Exporter.clearMp4History}><Trash2 size={16} />Wyczyść MP4</button>}
        </div>
        <div className="sequence-progress" aria-label="Postęp eksportu MP4">
          <span style={{ width: `${mp4Exporter.mp4State.progress}%` }} />
        </div>
        <p className={`render-status ${mp4Exporter.mp4State.status}`}>{mp4Exporter.mp4State.message}</p>
        <div className="render-history">
          {mp4Exporter.mp4Exports.length === 0 ? <span className="empty-state">Brak eksportów MP4. Wyrenderuj sekwencję PNG i wybierz MP4 bez audio albo MP4 + audio.</span> : mp4Exporter.mp4Exports.map((item) => (
            <article key={item.id} className="render-history-item">
              <div><strong>{item.fileName}</strong><span>{new Date(item.createdAt).toLocaleString('pl-PL')} · {item.duration}s · {item.fps} fps · {item.width}×{item.height} · {formatBytes(item.size)} · {item.hasAudio ? `audio + video (${item.audioName || 'audio'})` : 'video only'}</span></div>
              <div className="render-history-actions">
                <a className="ghost-button compact" href={item.downloadUrl} download={item.fileName}><Download size={16} />Pobierz MP4</a>
                <button className="ghost-button compact" onClick={() => mp4Exporter.removeMp4Export(item.id)}><Trash2 size={16} />Usuń</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="render-export-panel">
        <div>
          <p className="panel-kicker">Local render jobs</p>
          <h2>Kolejka lokalnych zadań renderu</h2>
          <p>Lista zadań przygotowująca lokalny workflow pod ZIP, MP4, manifesty i późniejszy natywny renderer.</p>
        </div>
        <div className="render-export-actions">
          {renderJobs.jobs.length > 0 && <button className="ghost-button compact" onClick={renderJobs.clearJobs}><Trash2 size={16} />Wyczyść jobs</button>}
        </div>
        <p className={`render-status ${renderJobs.jobsState.status}`}>{renderJobs.jobsState.message}</p>
        <div className="render-history">
          {renderJobs.jobs.length === 0 ? <span className="empty-state">Brak render jobs. Spakuj ZIP, przygotuj plan MP4 albo utwórz desktop job.</span> : renderJobs.jobs.map((job) => (
            <article key={job.id} className="render-history-item">
              <div><strong>{job.target} · {job.status}</strong><span>{new Date(job.createdAt).toLocaleString('pl-PL')} · {job.progress}% · {job.message}</span></div>
              <div className="render-history-actions"><button className="ghost-button compact" onClick={() => renderJobs.removeJob(job.id)}><Trash2 size={16} />Usuń</button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="render-export-panel">
        <div>
          <p className="panel-kicker">Local WebM recorder</p>
          <h2>Eksport WebM {audio ? 'z audio' : 'bez audio'}</h2>
          <p>{audio ? 'MediaRecorder połączy obraz z canvas i lokalną ścieżkę audio z Web Audio API.' : 'Dodaj MP3/WAV, aby eksport WebM zawierał także ścieżkę audio.'}</p>
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
            <span className="empty-state">Brak eksportów. Nagraj pierwszy plik WebM, a pojawi się tutaj jako lokalny plik sesyjny.</span>
          ) : recorder.exportHistory.map((item) => (
            <article key={item.id} className="render-history-item">
              <div>
                <strong>{item.fileName}</strong>
                <span>{new Date(item.createdAt).toLocaleString('pl-PL')} · {item.duration}s · {formatBytes(item.size)} · {item.hasAudio ? 'audio + video' : 'video only'} · {item.persisted ? 'zapisane lokalnie' : 'sesyjne'}</span>
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
        <FileDropzone icon={<ImagePlus />} title="Zdjęcia" description="JPG, PNG, WEBP. Pliki zostają na komputerze i służą do lokalnego timeline/renderu." accept="image/*" multiple files={images} onFiles={setImages} />
        <FileDropzone icon={<Music />} title="Muzyka" description="MP3/WAV. Jeden lokalny plik audio do synchronizacji montażu." accept="audio/*" multiple={false} files={audio ? [audio] : []} onFiles={(next) => setAudio(next[0] ?? null)} />
      </section>

      <section className="audio-panel waveform-panel">
        <div>
          <p className="panel-kicker">Waveform + beat grid</p>
          <h2>Lokalna analiza utworu i korekta tempa klipów</h2>
          <p>{audioAnalysis ? describeAudioAnalysis(audioAnalysis) : 'Wrzuć audio, aby lokalnie wygenerować waveform, beat mapę i szacunkowe BPM.'}</p>
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
      <section id="roadmap" className="roadmap-panel"><div><h2>Desktop roadmap</h2><p>Kolejne kroki: render-plan.json, natywny FFmpeg, audio mux i instalator Windows.</p></div><div className="roadmap-list"><span><RefreshCcw size={16} /> render-plan.json</span><span><Film size={16} /> natywny FFmpeg MP4</span><span><Download size={16} /> instalator Windows</span></div></section>
    </main>
  );
}

function ImportedMediaReportPanel({ report }) {
  const statusLabel = report.ready ? 'komplet' : 'braki';
  const warningMessage = report.missingImageCount > 0
    ? `Brakuje ${report.missingImageCount} plików zdjęć z importowanego projektu.`
    : `Brakuje ${report.missingPinnedClips.length} przypięć do klipów z importowanego projektu.`;

  return (
    <div className={`import-media-report ${report.ready ? 'ready' : 'warning'}`}>
      <div className="import-media-report-header">
        <div>
          <strong>Media po imporcie: {report.matchedImageCount}/{report.expectedImageCount} dopasowane · {statusLabel}</strong>
          <span>{report.ready ? 'Projekt ma komplet aktualnie wymaganych zdjęć.' : warningMessage}</span>
        </div>
        {!report.ready && (
          <a className="ghost-button compact" href="#upload">
            <Upload size={16} />Dograj media
          </a>
        )}
      </div>

      {report.missingImages.length > 0 && (
        <ul className="missing-media-list" aria-label="Brakujące media po imporcie projektu">
          {report.missingImages.map((asset) => (
            <li key={asset.id || asset.name}>
              <span><AlertTriangle size={15} />{asset.name}</span>
              <em>{asset.width && asset.height ? `${asset.width}×${asset.height}` : 'brak wymiarów'} · {formatBytes(asset.size)}</em>
            </li>
          ))}
        </ul>
      )}

      {report.missingPinnedClips.length > 0 && (
        <div className="missing-pin-list">
          {report.missingPinnedClips.map((pin) => (
            <span key={`${pin.clipIndex}-${pin.assetId}`}>Klip {pin.clipIndex}: {pin.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
