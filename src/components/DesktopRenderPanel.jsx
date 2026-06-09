import { FolderOpen, Monitor, RefreshCcw, Trash2 } from 'lucide-react';
import DesktopRenderHistory from './DesktopRenderHistory.jsx';

export default function DesktopRenderPanel({ desktop, onCreateDesktopRenderJob }) {
  return (
    <section className="render-export-panel">
      <div>
        <p className="panel-kicker">Desktop render</p>
        <h2>Lokalny render na dysku</h2>
        <p>{desktop.available ? 'Desktop bridge aktywny. Wybierz folder eksportu i utwórz lokalny render job z manifestem.' : 'Ten panel aktywuje się po uruchomieniu przez aplikację FotoBeat Desktop.'}</p>
      </div>

      <div className="render-export-actions">
        <button className="ghost-button compact" onClick={desktop.refreshFfmpegStatus} disabled={!desktop.available}><RefreshCcw size={16} />Sprawdź FFmpeg</button>
        <button className="ghost-button compact" onClick={desktop.pickOutputFolder} disabled={!desktop.available}><FolderOpen size={16} />Folder eksportu</button>
        <button className="primary-button compact" onClick={() => onCreateDesktopRenderJob()} disabled={!desktop.available}><Monitor size={16} />Render lokalny</button>
        {desktop.localRenderJob && <button className="ghost-button compact" onClick={desktop.clearLocalRenderJob}><Trash2 size={16} />Wyczyść desktop job</button>}
      </div>

      <p className={`render-status ${desktop.status.type}`}>{desktop.status.message}</p>

      <div className="desktop-health-grid">
        <p className={desktop.ffmpegReady ? 'desktop-health ready' : 'desktop-health warning'}>
          <strong>FFmpeg</strong>
          <span>{desktop.ffmpegReady ? `Gotowy · ${desktop.ffmpegStatus?.version ?? desktop.ffmpegStatus?.binary}` : 'Niewykryty'}</span>
        </p>
        {desktop.ffmpegStatus?.binary && <p className="desktop-health"><strong>Binary</strong><span>{desktop.ffmpegStatus.binary}</span></p>}
        {desktop.ffmpegStatus?.installHint && <p className="desktop-health warning"><strong>Install hint</strong><span>{desktop.ffmpegStatus.installHint}</span></p>}
      </div>

      {desktop.version && <p className="desktop-meta">{desktop.version.platform} · app {desktop.version.appVersion} · Electron {desktop.version.electronVersion}</p>}
      {desktop.outputFolder && <p className="desktop-meta">Folder: {desktop.outputFolder}</p>}

      {desktop.localRenderJob && (
        <div className="render-history">
          <article className="render-history-item">
            <div>
              <strong>{desktop.localRenderJob.id} · {desktop.localRenderJob.status} · {desktop.localRenderJob.mode ?? 'unknown-mode'}</strong>
              <span>{desktop.localRenderJob.progress}% · {desktop.localRenderJob.outputPath ?? 'oczekuje na outputPath'}</span>
              {desktop.localRenderJob.nativeResultSummary?.output?.sizeBytes && <span>MP4: {formatBytes(desktop.localRenderJob.nativeResultSummary.output.sizeBytes)}</span>}
            </div>
            <div className="sequence-progress desktop-progress"><span style={{ width: `${desktop.localRenderJob.progress}%` }} /></div>
            <div className="desktop-log-list">{desktop.localRenderJob.logs?.slice(-4).map((log, index) => <code key={`${log}-${index}`}>{log}</code>)}</div>
          </article>
        </div>
      )}

      <DesktopRenderHistory
        history={desktop.renderHistory}
        disabled={!desktop.available}
        onRefresh={() => desktop.refreshRenderHistory()}
        onClear={desktop.clearRenderHistory}
      />
    </section>
  );
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
