const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const HISTORY_DIR = path.join(os.homedir(), '.fotobeat-desktop');
const HISTORY_PATH = path.join(HISTORY_DIR, 'render-history.json');
const MAX_HISTORY_ITEMS = 80;

async function listRenderHistory(limit = MAX_HISTORY_ITEMS) {
  const history = await readHistoryFile();
  return history.slice(0, limit);
}

async function upsertRenderHistory(job) {
  if (!job?.id) return null;

  const history = await readHistoryFile();
  const nextEntry = createHistoryEntry(job);
  const withoutCurrent = history.filter((entry) => entry.id !== job.id);
  const nextHistory = [nextEntry, ...withoutCurrent]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_HISTORY_ITEMS);

  await writeHistoryFile(nextHistory);
  return nextEntry;
}

async function clearRenderHistory() {
  await writeHistoryFile([]);
  return [];
}

async function readHistoryFile() {
  try {
    const raw = await fs.readFile(HISTORY_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    return [];
  }
}

async function writeHistoryFile(history) {
  await fs.mkdir(HISTORY_DIR, { recursive: true });
  await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
}

function createHistoryEntry(job) {
  return {
    schemaVersion: 'fotobeat.desktop.render-history-entry.v1',
    id: job.id,
    status: job.status,
    mode: job.mode ?? null,
    progress: job.progress,
    nativeReady: Boolean(job.nativeReady),
    hasNativeResult: Boolean(job.nativeResult),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    projectName: job.manifest?.project?.name ?? job.manifest?.project?.title ?? null,
    outputPath: job.outputPath ?? null,
    tempOutputPath: job.tempOutputPath ?? null,
    sidecarPath: job.sidecarPath ?? null,
    jobFolder: job.jobFolder ?? null,
    outputFolder: job.outputFolder ?? null,
    frameImport: job.frameImport ? {
      count: job.frameImport.count,
      totalSize: job.frameImport.totalSize,
      framesFolder: job.frameImport.framesFolder,
      manifestPath: job.frameImport.manifestPath,
      firstFrame: job.frameImport.firstFrame,
      lastFrame: job.frameImport.lastFrame
    } : null,
    nativeResult: job.nativeResult ? {
      outputPath: job.nativeResult.outputPath,
      tempOutputPath: job.nativeResult.tempOutputPath,
      output: job.nativeResult.output,
      exitCode: job.nativeResult.ffmpeg?.exitCode,
      ffmpegBinary: job.nativeResult.ffmpeg?.binary,
      startedAt: job.nativeResult.startedAt,
      finishedAt: job.nativeResult.finishedAt
    } : null,
    integrity: job.integrity ? {
      warnings: job.integrity.warnings ?? [],
      outputInspection: job.integrity.outputInspection ?? null
    } : null,
    lastLog: Array.isArray(job.logs) && job.logs.length ? job.logs[job.logs.length - 1] : null
  };
}

module.exports = {
  HISTORY_PATH,
  clearRenderHistory,
  listRenderHistory,
  upsertRenderHistory
};
