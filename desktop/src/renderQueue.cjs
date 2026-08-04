const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { buildRenderPlan } = require('./renderPlan.cjs');
const {
  cleanupPartialOutput,
  createCollisionSafePath,
  inspectOutput,
  prepareRenderWorkspace,
  promoteTempOutput,
  writeOutputSidecar
} = require('./exportIntegrity.cjs');
const { findRenderHistoryEntry, upsertRenderHistory } = require('./jobHistory.cjs');
const { runNativeFfmpegRender, validateRenderPlan } = require('./nativeFfmpegRenderer.cjs');

const jobs = new Map();
const runningProcesses = new Map();

async function createLocalRenderJob(payload = {}) {
  const id = `local-render-${randomUUID()}`;
  const outputFolder = payload.outputFolder || path.join(os.homedir(), 'FotoBeat-renders');
  const preferredFileName = `fotobeat-${id}.mp4`;

  const job = createBaseJob({ id, outputFolder, manifest: payload.manifest });

  try {
    await prepareJobWorkspace(job, payload, preferredFileName);
  } catch (error) {
    job.status = 'failed';
    job.logs.push(`Failed to prepare render workspace: ${error.message}`);
    await persistJobHistory(job);
  }

  jobs.set(job.id, job);

  if (job.status !== 'failed' && payload.deferStart) {
    await holdJobForFrameImport(job);
  } else if (job.status !== 'failed') {
    scheduleRenderProgress(job.id);
  }

  return stripHeavyPayload(job);
}

function getLocalRenderJob(jobId) {
  const job = jobs.get(jobId);
  return job ? stripHeavyPayload(job) : null;
}

async function cancelLocalRenderJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return null;

  job.cancelRequested = true;
  job.updatedAt = new Date().toISOString();
  job.logs.push('Cancel requested by user.');

  const child = runningProcesses.get(jobId);
  if (child && !child.killed) {
    child.kill('SIGTERM');
  } else if (!['done', 'failed', 'canceled'].includes(job.status)) {
    await cancelJob(job);
  }

  jobs.set(jobId, job);
  return stripHeavyPayload(job);
}

async function retryLocalRenderJob(jobId, options = {}) {
  const job = jobs.get(jobId) ?? await rehydrateLocalRenderJob(jobId, options);
  if (!job) {
    throw new Error('Retry requires an active job or a persisted render workspace.');
  }

  if (!['failed', 'canceled', 'done'].includes(job.status)) {
    throw new Error(`Cannot retry job with status ${job.status}.`);
  }

  const previousStatus = job.status;
  await cleanupPartialOutput(job);
  if (previousStatus === 'done') {
    await allocateRetryOutputPaths(job);
  }
  job.nativeReady = await isNativeReady(job);
  job.status = 'queued';
  job.progress = 0;
  job.mode = job.nativeReady ? 'native-ready' : 'placeholder';
  job.nativeResult = null;
  job.cancelRequested = false;
  job.updatedAt = new Date().toISOString();
  job.logs.push('Retry requested by user.');
  job.renderPlan = buildRenderPlan(job);
  await writeRenderPlan(job);
  await writeJobStatus(job);
  await writeOutputSidecar(job);
  await persistJobHistory(job);
  jobs.set(job.id, job);
  if (options.schedule !== false) {
    scheduleRenderProgress(job.id);
  }
  return stripHeavyPayload(job);
}

async function appendLocalRenderJobFrames(jobId, frames = [], options = {}) {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error('Frame import is available only for jobs still loaded in the current desktop session.');
  }

  if (['done', 'failed', 'canceled'].includes(job.status)) {
    throw new Error(`Cannot append frames to job with status ${job.status}.`);
  }

  if (job.status !== 'importing') {
    throw new Error(`Frame import is only available while a job is importing, not ${job.status}.`);
  }

  if (!Array.isArray(frames)) {
    throw new Error('Frame chunk payload must be an array.');
  }

  if (frames.length > 0) {
    job.frameImport = await writeFrameSequenceFiles(job, frames, { append: true });
    job.logs.push(`Imported frame chunk: ${frames.length} files, ${job.frameImport.count} total.`);
  }

  job.renderPlan = buildRenderPlan(job);
  job.nativeReady = await isNativeReady(job);
  job.updatedAt = new Date().toISOString();

  if (options.complete) {
    job.status = 'queued';
    job.mode = job.nativeReady ? 'native-ready' : 'placeholder';
    job.logs.push(job.nativeReady
      ? `Frame import complete: ${job.frameImport?.count ?? 0} frames ready for native FFmpeg.`
      : 'Frame import complete, but native FFmpeg input is still missing.');
    await writeRenderPlan(job);
    await writeJobStatus(job);
    await writeOutputSidecar(job);
    await persistJobHistory(job);
    scheduleRenderProgress(job.id);
  } else {
    job.status = 'importing';
    job.mode = 'importing';
    job.logs.push(`Waiting for next frame chunk: ${job.frameImport?.count ?? 0} frames imported.`);
    await writeRenderPlan(job);
    await writeJobStatus(job);
    await writeOutputSidecar(job);
    await persistJobHistory(job);
  }

  jobs.set(job.id, job);
  return stripHeavyPayload(job);
}

function createBaseJob({ id, outputFolder, manifest }) {
  return {
    id,
    status: 'queued',
    progress: 0,
    mode: 'preparing',
    nativeReady: false,
    nativeResult: null,
    cancelRequested: false,
    manifest: manifest ?? null,
    renderPlan: null,
    outputFolder,
    jobFolder: null,
    manifestPath: null,
    renderPlanPath: null,
    statusPath: null,
    outputPath: null,
    tempOutputPath: null,
    sidecarPath: null,
    integrity: null,
    frameImport: null,
    audioImport: null,
    logs: ['Local desktop render job queued'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function holdJobForFrameImport(job) {
  job.status = 'importing';
  job.progress = 0;
  job.mode = 'importing';
  job.updatedAt = new Date().toISOString();
  job.logs.push('Render job is waiting for chunked frame import before encoding starts.');
  await writeJobStatus(job);
  await writeOutputSidecar(job);
  await persistJobHistory(job);
  jobs.set(job.id, job);
}

async function prepareJobWorkspace(job, payload, preferredFileName) {
  const workspace = await prepareRenderWorkspace({ outputFolder: job.outputFolder, jobId: job.id, preferredFileName });
  job.jobFolder = workspace.jobFolder;
  job.outputPath = workspace.outputPath;
  job.tempOutputPath = workspace.tempOutputPath;
  job.sidecarPath = workspace.sidecarPath;
  job.integrity = {
    freeSpace: workspace.freeSpace,
    warnings: workspace.warnings,
    outputInspection: null
  };
  job.manifestPath = path.join(job.jobFolder, 'manifest.fotobeat.json');
  job.renderPlanPath = path.join(job.jobFolder, 'render-plan.json');
  job.statusPath = path.join(job.jobFolder, 'render-job.json');

  if (payload.audioFile) {
    job.audioImport = await writeAudioInputFile(job, payload.audioFile);
    job.logs.push(`Imported audio input: ${job.audioImport.path}`);
  }

  job.renderPlan = buildRenderPlan(job);
  job.outputPath = job.renderPlan.output.path;
  job.tempOutputPath = job.renderPlan.output.tempPath;
  job.sidecarPath = `${job.outputPath}.json`;

  if (Array.isArray(payload.frames) && payload.frames.length > 0) {
    job.frameImport = await writeFrameSequenceFiles(job, payload.frames);
    job.logs.push(`Imported ${job.frameImport.count} frame files into ${job.frameImport.framesFolder}`);
  }

  job.renderPlan = buildRenderPlan(job);
  job.nativeReady = await isNativeReady(job);
  job.mode = job.nativeReady ? 'native-ready' : 'placeholder';

  await writeManifest(job);
  await writeRenderPlan(job);
  await writeJobStatus(job);
  await writeOutputSidecar(job);
  await persistJobHistory(job);
  job.logs.push(`Render workspace prepared: ${job.jobFolder}`);
  job.logs.push(`Render plan written: ${job.renderPlanPath}`);
  job.logs.push(job.nativeReady
    ? 'Native FFmpeg input detected: frames/frame_0001.png'
    : 'Native FFmpeg input missing: add frames/frame_0001.png to job workspace to enable real encode.');
  workspace.warnings.forEach((warning) => job.logs.push(`Warning: ${warning}`));
}

function scheduleRenderProgress(jobId) {
  const interval = setInterval(async () => {
    const job = jobs.get(jobId);

    if (!job || ['done', 'failed', 'canceled'].includes(job.status)) {
      clearInterval(interval);
      return;
    }

    try {
      if (job.cancelRequested) {
        await cancelJob(job);
        jobs.set(jobId, job);
        clearInterval(interval);
        return;
      }

      if (job.nativeReady) {
        clearInterval(interval);
        await runNativeJob(job);
        jobs.set(jobId, job);
        return;
      }

      const nextProgress = Math.min(100, job.progress + 20);
      job.progress = nextProgress;
      job.status = nextProgress >= 100 ? 'done' : 'rendering';
      job.logs.push(createLog(nextProgress, job.mode));
      job.updatedAt = new Date().toISOString();

      if (job.status === 'done') {
        await writeMockOutput(job);
        await promoteTempOutput(job);
        job.integrity.outputInspection = await inspectOutput(job);
        job.logs.push(`Placeholder output promoted: ${job.outputPath}`);
        await writeOutputSidecar(job);
        await persistJobHistory(job);
        clearInterval(interval);
      }

      await writeJobStatus(job);
      await persistJobHistory(job);
      jobs.set(jobId, job);
    } catch (error) {
      if (job.cancelRequested) {
        await cancelJob(job);
      } else {
        await failJob(job, error);
      }
      jobs.set(jobId, job);
      clearInterval(interval);
    }
  }, 1200);
}

async function runNativeJob(job) {
  job.status = 'rendering';
  job.progress = Math.max(job.progress, 5);
  job.mode = 'native-ffmpeg';
  job.updatedAt = new Date().toISOString();
  job.logs.push('Starting native FFmpeg render from render-plan.json');
  await writeJobStatus(job);
  await persistJobHistory(job);

  const validation = await validateRenderPlan(job.renderPlan);
  if (!validation.ok) {
    throw new Error(`Native render validation failed: ${validation.errors.join(' | ')}`);
  }
  validation.warnings.forEach((warning) => job.logs.push(`Native warning: ${warning}`));

  try {
    const result = await runNativeFfmpegRender({
      renderPlanPath: job.renderPlanPath,
      onSpawn: (child) => runningProcesses.set(job.id, child),
      onProgress: ({ progress }) => {
        job.progress = Math.max(job.progress, progress);
        job.updatedAt = new Date().toISOString();
      },
      onLog: (log) => {
        if (!log) return;
        const normalized = log.length > 240 ? `${log.slice(0, 240)}...` : log;
        job.logs.push(`ffmpeg: ${normalized}`);
      }
    });

    await promoteTempOutput(job);
    job.nativeResult = result;
    job.status = 'done';
    job.progress = 100;
    job.updatedAt = new Date().toISOString();
    job.integrity.outputInspection = await inspectOutput(job);
    job.logs.push(`Native FFmpeg output promoted: ${job.outputPath}`);
    await writeJobStatus(job);
    await writeOutputSidecar(job);
    await persistJobHistory(job);
  } finally {
    runningProcesses.delete(job.id);
  }
}

async function failJob(job, error) {
  job.status = 'failed';
  job.updatedAt = new Date().toISOString();
  job.logs.push(`Render failed: ${error.message}`);
  await cleanupPartialOutput(job);
  await writeJobStatus(job);
  await writeOutputSidecar(job);
  await persistJobHistory(job);
}

async function cancelJob(job) {
  job.status = 'canceled';
  job.updatedAt = new Date().toISOString();
  job.logs.push('Render canceled by user.');
  await cleanupPartialOutput(job);
  await writeJobStatus(job);
  await writeOutputSidecar(job);
  await persistJobHistory(job);
}

async function rehydrateLocalRenderJob(jobId, options = {}) {
  const historyEntry = options.jobFolder ? null : await findRenderHistoryEntry(jobId);
  const jobFolder = options.jobFolder ?? historyEntry?.jobFolder ?? null;

  if (!jobFolder) {
    return null;
  }

  const statusPath = path.join(jobFolder, 'render-job.json');
  const persisted = await readJsonFile(statusPath);
  const persistedId = persisted.id ?? jobId;
  if (persistedId !== jobId) {
    throw new Error(`Persisted render job id mismatch: expected ${jobId}, got ${persistedId}.`);
  }

  const manifestPath = persisted.manifestPath ?? path.join(jobFolder, 'manifest.fotobeat.json');
  const manifestEnvelope = await readJsonFile(manifestPath);
  const outputPath = persisted.outputPath ?? historyEntry?.outputPath ?? path.join(jobFolder, `fotobeat-${jobId}.mp4`);
  const job = createBaseJob({
    id: jobId,
    outputFolder: persisted.outputFolder ?? historyEntry?.outputFolder ?? path.dirname(jobFolder),
    manifest: manifestEnvelope.manifest ?? persisted.manifest ?? null
  });

  job.status = persisted.status ?? historyEntry?.status ?? 'failed';
  job.progress = Number(persisted.progress) || 0;
  job.mode = persisted.mode ?? historyEntry?.mode ?? 'placeholder';
  job.nativeReady = Boolean(persisted.nativeReady);
  job.nativeResult = null;
  job.cancelRequested = false;
  job.jobFolder = jobFolder;
  job.manifestPath = manifestPath;
  job.renderPlanPath = persisted.renderPlanPath ?? path.join(jobFolder, 'render-plan.json');
  job.statusPath = statusPath;
  job.outputPath = outputPath;
  job.tempOutputPath = persisted.tempOutputPath ?? `${outputPath}.partial`;
  job.sidecarPath = persisted.sidecarPath ?? `${outputPath}.json`;
  job.integrity = persisted.integrity ?? { freeSpace: null, warnings: [], outputInspection: null };
  job.frameImport = persisted.frameImport ?? await readOptionalJson(path.join(jobFolder, 'frames', 'frames-manifest.json'));
  job.audioImport = persisted.audioImport ?? await readOptionalJson(path.join(jobFolder, 'audio', 'audio-manifest.json'));
  job.logs = Array.isArray(persisted.logs) ? persisted.logs : ['Render job rehydrated from persisted workspace.'];
  job.createdAt = persisted.createdAt ?? historyEntry?.createdAt ?? new Date().toISOString();
  job.updatedAt = persisted.updatedAt ?? historyEntry?.updatedAt ?? new Date().toISOString();
  job.renderPlan = buildRenderPlan(job);
  job.nativeReady = await isNativeReady(job);
  job.logs.push('Render job rehydrated from persisted workspace.');
  return job;
}

async function allocateRetryOutputPaths(job) {
  if (!job.jobFolder || !job.outputPath) return;
  const nextOutputPath = await createCollisionSafePath(job.jobFolder, path.basename(job.outputPath));
  if (nextOutputPath === job.outputPath) return;
  job.outputPath = nextOutputPath;
  job.tempOutputPath = `${nextOutputPath}.partial`;
  job.sidecarPath = `${nextOutputPath}.json`;
  job.logs.push(`Retry output path allocated: ${nextOutputPath}`);
}

async function writeAudioInputFile(job, audioFile) {
  const audioFolder = path.join(job.jobFolder, 'audio');
  const targetPath = path.join(audioFolder, 'input-audio');
  const manifestPath = path.join(audioFolder, 'audio-manifest.json');
  await fs.mkdir(audioFolder, { recursive: true });
  const buffer = toBuffer(audioFile);
  await fs.writeFile(targetPath, buffer);
  const audioImport = {
    schemaVersion: 'fotobeat.desktop.audio-import.v1',
    path: targetPath,
    relativePath: 'audio/input-audio',
    manifestPath,
    sourceFileName: audioFile.fileName ?? audioFile.name ?? null,
    type: audioFile.type ?? null,
    size: buffer.byteLength
  };
  await fs.writeFile(manifestPath, JSON.stringify(audioImport, null, 2), 'utf8');
  return audioImport;
}

async function writeFrameSequenceFiles(job, frames, { append = false } = {}) {
  const framesFolder = path.join(job.jobFolder, 'frames');
  const manifestPath = path.join(framesFolder, 'frames-manifest.json');
  await fs.mkdir(framesFolder, { recursive: true });

  let totalSize = append ? Number(job.frameImport?.totalSize) || 0 : 0;
  const written = append && Array.isArray(job.frameImport?.written)
    ? [...job.frameImport.written]
    : [];
  const offset = written.length;

  const sortedFrames = [...frames].sort((a, b) => Number(a.index ?? 0) - Number(b.index ?? 0));

  for (let index = 0; index < sortedFrames.length; index += 1) {
    const frame = sortedFrames[index];
    const sequenceIndex = offset + index;
    const fileName = `frame_${String(sequenceIndex + 1).padStart(4, '0')}.png`;
    const targetPath = path.join(framesFolder, fileName);
    const buffer = toBuffer(frame);
    await fs.writeFile(targetPath, buffer);
    totalSize += buffer.byteLength;
    written.push({
      sourceIndex: Number(frame.index ?? index),
      sequenceIndex,
      fileName,
      path: targetPath,
      sourceFileName: frame.fileName ?? null,
      sourceSize: frame.size ?? null,
      size: buffer.byteLength
    });
  }

  const frameImport = {
    schemaVersion: 'fotobeat.desktop.frame-import.v1',
    framesFolder,
    manifestPath,
    count: written.length,
    totalSize,
    firstFrame: written[0] ?? null,
    lastFrame: written[written.length - 1] ?? null,
    written
  };

  await fs.writeFile(manifestPath, JSON.stringify(frameImport, null, 2), 'utf8');
  return frameImport;
}

function toBuffer(item) {
  const candidate = item?.arrayBuffer ?? item?.buffer ?? item?.data ?? item?.bytes;

  if (!candidate) {
    throw new Error(`Binary payload is missing for ${item?.fileName ?? item?.name ?? item?.index ?? '?'}.`);
  }

  if (Buffer.isBuffer(candidate)) return candidate;
  if (candidate instanceof ArrayBuffer) return Buffer.from(candidate);
  if (ArrayBuffer.isView(candidate)) return Buffer.from(candidate.buffer, candidate.byteOffset, candidate.byteLength);
  if (Array.isArray(candidate)) return Buffer.from(candidate);

  throw new Error(`Unsupported binary payload for ${item?.fileName ?? item?.name ?? item?.index ?? '?'}.`);
}

async function isNativeReady(job) {
  if (job.renderPlan?.inputMode !== 'frame-sequence') return false;
  return pathExists(path.join(job.jobFolder, 'frames', 'frame_0001.png'));
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(targetPath) {
  const raw = await fs.readFile(targetPath, 'utf8');
  return JSON.parse(raw);
}

async function readOptionalJson(targetPath) {
  try {
    return await readJsonFile(targetPath);
  } catch {
    return null;
  }
}

async function writeManifest(job) {
  await fs.writeFile(job.manifestPath, JSON.stringify({
    jobId: job.id,
    createdAt: job.createdAt,
    manifest: job.manifest
  }, null, 2), 'utf8');
}

async function writeRenderPlan(job) {
  await fs.writeFile(job.renderPlanPath, JSON.stringify(job.renderPlan, null, 2), 'utf8');
}

async function writeJobStatus(job) {
  await fs.writeFile(job.statusPath, JSON.stringify(stripHeavyPayload(job), null, 2), 'utf8');
}

async function writeMockOutput(job) {
  const content = [
    'FotoBeat Desktop placeholder render output',
    `job=${job.id}`,
    `createdAt=${job.createdAt}`,
    `completedAt=${job.updatedAt}`,
    `renderPlan=${job.renderPlanPath}`,
    `sidecar=${job.sidecarPath}`,
    '',
    'Native FFmpeg was not started because frames/frame_0001.png was missing in the job workspace.',
    'Export/copy a frame sequence into the frames/ directory and rerun the job to enable real MP4 encoding.'
  ].join('\n');

  await fs.writeFile(job.tempOutputPath, content, 'utf8');
  job.logs.push(`Placeholder temp output written: ${job.tempOutputPath}`);
}

async function persistJobHistory(job) {
  try {
    await upsertRenderHistory(job);
  } catch (error) {
    job.logs.push(`History warning: ${error.message}`);
  }
}

function stripHeavyPayload(job) {
  const { manifest, renderPlan, nativeResult, ...rest } = job;
  return {
    ...rest,
    hasManifest: Boolean(manifest),
    hasRenderPlan: Boolean(renderPlan),
    hasNativeResult: Boolean(nativeResult),
    nativeResultSummary: nativeResult ? {
      schemaVersion: nativeResult.schemaVersion,
      outputPath: nativeResult.outputPath,
      tempOutputPath: nativeResult.tempOutputPath,
      exitCode: nativeResult.ffmpeg?.exitCode,
      ffmpegBinary: nativeResult.ffmpeg?.binary,
      output: nativeResult.output,
      startedAt: nativeResult.startedAt,
      finishedAt: nativeResult.finishedAt
    } : null,
    renderPlanSummary: renderPlan ? {
      schemaVersion: renderPlan.schemaVersion,
      inputMode: renderPlan.inputMode,
      outputPath: renderPlan.output?.path,
      tempOutputPath: renderPlan.output?.tempPath,
      ffmpegPreview: renderPlan.ffmpeg?.preview,
      audioImported: Boolean(renderPlan.inputs?.audio?.imported)
    } : null
  };
}

function createLog(progress, mode) {
  if (mode === 'placeholder') {
    if (progress < 30) return 'Checking local render workspace';
    if (progress < 60) return 'Waiting for frame sequence files';
    if (progress < 100) return 'Writing placeholder output because native frames are missing';
    return 'Placeholder render complete';
  }

  if (progress < 30) return 'Resolving local media paths';
  if (progress < 60) return 'Preparing frames and transitions';
  if (progress < 100) return 'Encoding local MP4 output';
  return 'Local render complete';
}

module.exports = {
  appendLocalRenderJobFrames,
  cancelLocalRenderJob,
  createLocalRenderJob,
  getLocalRenderJob,
  retryLocalRenderJob
};
