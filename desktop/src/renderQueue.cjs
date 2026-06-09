const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { buildRenderPlan } = require('./renderPlan.cjs');
const {
  cleanupPartialOutput,
  inspectOutput,
  prepareRenderWorkspace,
  promoteTempOutput,
  writeOutputSidecar
} = require('./exportIntegrity.cjs');
const { runNativeFfmpegRender, validateRenderPlan } = require('./nativeFfmpegRenderer.cjs');

const jobs = new Map();

async function createLocalRenderJob(payload = {}) {
  const id = `local-render-${randomUUID()}`;
  const outputFolder = payload.outputFolder || path.join(os.homedir(), 'FotoBeat-renders');
  const preferredFileName = `fotobeat-${id}.mp4`;

  const job = {
    id,
    status: 'queued',
    progress: 0,
    mode: 'preparing',
    nativeReady: false,
    nativeResult: null,
    manifest: payload.manifest ?? null,
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
    logs: ['Local desktop render job queued'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const workspace = await prepareRenderWorkspace({ outputFolder, jobId: id, preferredFileName });
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
    job.renderPlan = buildRenderPlan(job);
    job.outputPath = job.renderPlan.output.path;
    job.tempOutputPath = job.renderPlan.output.tempPath;
    job.sidecarPath = `${job.outputPath}.json`;

    if (Array.isArray(payload.frames) && payload.frames.length > 0) {
      job.frameImport = await writeFrameSequenceFiles(job, payload.frames);
      job.logs.push(`Imported ${job.frameImport.count} frame files into ${job.frameImport.framesFolder}`);
    }

    job.nativeReady = await isNativeReady(job);
    job.mode = job.nativeReady ? 'native-ready' : 'placeholder';

    await writeManifest(job);
    await writeRenderPlan(job);
    await writeJobStatus(job);
    await writeOutputSidecar(job);
    job.logs.push(`Render workspace prepared: ${job.jobFolder}`);
    job.logs.push(`Render plan written: ${job.renderPlanPath}`);
    job.logs.push(job.nativeReady
      ? 'Native FFmpeg input detected: frames/frame_0001.png'
      : 'Native FFmpeg input missing: add frames/frame_0001.png to job workspace to enable real encode.');
    workspace.warnings.forEach((warning) => job.logs.push(`Warning: ${warning}`));
  } catch (error) {
    job.status = 'failed';
    job.logs.push(`Failed to prepare render workspace: ${error.message}`);
  }

  jobs.set(job.id, job);

  if (job.status !== 'failed') {
    scheduleRenderProgress(job.id);
  }

  return stripHeavyPayload(job);
}

function getLocalRenderJob(jobId) {
  const job = jobs.get(jobId);
  return job ? stripHeavyPayload(job) : null;
}

function scheduleRenderProgress(jobId) {
  const interval = setInterval(async () => {
    const job = jobs.get(jobId);

    if (!job || job.status === 'done' || job.status === 'failed') {
      clearInterval(interval);
      return;
    }

    try {
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
        clearInterval(interval);
      }

      await writeJobStatus(job);
      jobs.set(jobId, job);
    } catch (error) {
      await failJob(job, error);
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

  const validation = await validateRenderPlan(job.renderPlan);
  if (!validation.ok) {
    throw new Error(`Native render validation failed: ${validation.errors.join(' | ')}`);
  }
  validation.warnings.forEach((warning) => job.logs.push(`Native warning: ${warning}`));

  const result = await runNativeFfmpegRender({
    renderPlanPath: job.renderPlanPath,
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
}

async function failJob(job, error) {
  job.status = 'failed';
  job.updatedAt = new Date().toISOString();
  job.logs.push(`Render failed: ${error.message}`);
  await cleanupPartialOutput(job);
  await writeJobStatus(job);
  await writeOutputSidecar(job);
}

async function writeFrameSequenceFiles(job, frames) {
  const framesFolder = path.join(job.jobFolder, 'frames');
  const manifestPath = path.join(framesFolder, 'frames-manifest.json');
  await fs.mkdir(framesFolder, { recursive: true });

  let totalSize = 0;
  const written = [];

  const sortedFrames = [...frames].sort((a, b) => Number(a.index ?? 0) - Number(b.index ?? 0));

  for (let index = 0; index < sortedFrames.length; index += 1) {
    const frame = sortedFrames[index];
    const fileName = `frame_${String(index + 1).padStart(4, '0')}.png`;
    const targetPath = path.join(framesFolder, fileName);
    const buffer = toBuffer(frame);
    await fs.writeFile(targetPath, buffer);
    totalSize += buffer.byteLength;
    written.push({
      sourceIndex: Number(frame.index ?? index),
      sequenceIndex: index,
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

function toBuffer(frame) {
  const candidate = frame?.arrayBuffer ?? frame?.buffer ?? frame?.data ?? frame?.bytes;

  if (!candidate) {
    throw new Error(`Frame ${frame?.index ?? '?'} has no binary payload.`);
  }

  if (Buffer.isBuffer(candidate)) return candidate;
  if (candidate instanceof ArrayBuffer) return Buffer.from(candidate);
  if (ArrayBuffer.isView(candidate)) return Buffer.from(candidate.buffer, candidate.byteOffset, candidate.byteLength);
  if (Array.isArray(candidate)) return Buffer.from(candidate);

  throw new Error(`Unsupported frame binary payload for frame ${frame?.index ?? '?'}.`);
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
      ffmpegPreview: renderPlan.ffmpeg?.preview
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
  createLocalRenderJob,
  getLocalRenderJob
};
