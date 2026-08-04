import { ExternalLink, FileJson, FolderOpen, RefreshCcw, RotateCcw, Trash2 } from 'lucide-react';

const TERMINAL_RENDER_STATUSES = ['done', 'failed', 'canceled'];

export default function DesktopRenderHistory({ history = [], disabled = false, onRefresh, onClear, onShowItem, onOpenPath, onRetry, onSupportBundle }) {
  return (
    <div className="desktop-render-history-panel">
      <div className="desktop-render-history-heading">
        <div>
          <p className="panel-kicker">Historia desktop renderów</p>
          <h3>Ostatnie lokalne eksporty MP4</h3>
          <p>Lista jest odczytywana z trwałego pliku `~/.fotobeat-desktop/render-history.json`.</p>
        </div>
        <div className="render-export-actions">
          <button className="ghost-button compact" onClick={onRefresh} disabled={disabled}><RefreshCcw size={16} />Odśwież</button>
          {history.length > 0 && <button className="ghost-button compact" onClick={onClear} disabled={disabled}><Trash2 size={16} />Wyczyść</button>}
        </div>
      </div>

      <div className="render-history">
        {history.length === 0 ? (
          <span className="empty-state">Brak zapisanych renderów desktop. Po pierwszym `Desktop MP4` pojawią się tutaj wyniki z dysku.</span>
        ) : history.map((entry) => (
          <article key={entry.id} className="render-history-item desktop-history-item">
            <div>
              <strong>{entry.projectName || entry.id} · {entry.status} · {entry.mode || 'unknown-mode'}</strong>
              <span>{formatDate(entry.updatedAt)} · {entry.hasNativeResult ? 'native FFmpeg' : 'placeholder'} · {entry.outputPath || 'brak outputPath'}</span>
              {entry.frameImport && <span>{entry.frameImport.count} klatek · {formatBytes(entry.frameImport.totalSize)}</span>}
              {entry.nativeResult?.output?.sizeBytes && <span>MP4: {formatBytes(entry.nativeResult.output.sizeBytes)}</span>}
              {entry.lastLog && <code>{entry.lastLog}</code>}
            </div>
            <div className="render-history-actions desktop-path-actions">
              {canRetry(entry) && <button className="ghost-button compact" onClick={() => onRetry?.(entry)} disabled={disabled}><RotateCcw size={16} />Ponów</button>}
              {entry.jobFolder && <button className="ghost-button compact" onClick={() => onSupportBundle?.(entry)} disabled={disabled}><FileJson size={16} />Support JSON</button>}
              {entry.outputPath && <button className="ghost-button compact" onClick={() => onShowItem?.(entry.outputPath)} disabled={disabled}><ExternalLink size={16} />Pokaż plik</button>}
              {entry.jobFolder && <button className="ghost-button compact" onClick={() => onOpenPath?.(entry.jobFolder)} disabled={disabled}><FolderOpen size={16} />Folder joba</button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function canRetry(entry) {
  return Boolean(entry?.id && entry?.jobFolder && TERMINAL_RENDER_STATUSES.includes(entry.status));
}

function formatDate(value) {
  if (!value) return 'brak daty';
  return new Date(value).toLocaleString('pl-PL');
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
