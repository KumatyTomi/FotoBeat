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

const jobs = new Map();

async function createLocalRenderJob(payload = {}) {
  const id = `local-render-${randomUUID()}`;
  const outputFolder = payload.outputFolder || path.join(os.homedir(), 'FotoBeat-renders');
  const preferredFileName = `fotobeat-${id}.mp4`;

  const job = {
    id,
    status: 'queued',
    progress: 0,
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
    job.tempOutputPath = `${job.outputPath}.partial`;
    job.sidecarPath = `${job.outputPath}.json`;

    await writeManifest(job);
    await writeRenderPlan(job);
    await writeJobStatus(job);
    await writeOutputSidecar(job);
    job.logs.push(`Render workspace prepared: ${job.jobFolder}`);
    job.logs.push(`Render plan written: ${job.renderPlanPath}`);
    workspace.warnings.forEach((warning) => job.logs.push(`Warning: ${warning}`));
  } catch (error) {
    job.status = 'failed';
    job.logs.push(`Failed to prepare render workspace: ${error.message}`);
  }

  jobs.set(job.id, job);

  if (job.status !== 'failed') {
    scheduleMockProgress(job.id);
  }

  return stripHeavyPayload(job);
}

function getLocalRenderJob(jobId) {
  const job = jobs.get(jobId);
  return job ? stripHeavyPayload(job) : null;
}

function scheduleMockProgress(jobId) {
  const interval = setInterval(async () => {
    const job = jobs.get(jobId);

    if (!job || job.status === 'done' || job.status === 'failed') {
      clearInterval(interval);
      return;
    }

    try {
      const nextProgress = Math.min(100, job.progress + 20);
      job.progress = nextProgress;
      job.status = nextProgress >= 100 ? 'done' : 'rendering';
      job.logs.push(createLog(nextProgress));
      job.updatedAt = new Date().toISOString();

      if (job.status === 'done') {
        await writeMockOutput(job);
        await promoteTempOutput(job);
        job.integrity.outputInspection = await inspectOutput(job);
        job.logs.push(`Output promoted: ${job.outputPath}`);
        await writeOutputSidecar(job);
        clearInterval(interval);
      }

      await writeJobStatus(job);
      jobs.set(jobId, job);
    } catch (error) {
      job.status = 'failed';
      job.updatedAt = new Date().toISOString();
      job.logs.push(`Render failed: ${error.message}`);
      await cleanupPartialOutput(job);
      await writeJobStatus(job);
      await writeOutputSidecar(job);
      jobs.set(jobId, job);
      clearInterval(interval);
    }
  }, 1200);
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
    'FotoBeat Desktop mock render output',
    `job=${job.id}`,
    `createdAt=${job.createdAt}`,
    `completedAt=${job.updatedAt}`,
    `renderPlan=${job.renderPlanPath}`,
    `sidecar=${job.sidecarPath}`,
    '',
    'This placeholder marks where the final MP4 will be written by the local FFmpeg pipeline.',
    'Next implementation step: execute render-plan.json with native FFmpeg.'
  ].join('\n');

  await fs.writeFile(job.tempOutputPath, content, 'utf8');
  job.logs.push(`Mock temp output written: ${job.tempOutputPath}`);
}

function stripHeavyPayload(job) {
  const { manifest, renderPlan, ...rest } = job;
  return {
    ...rest,
    hasManifest: Boolean(manifest),
    hasRenderPlan: Boolean(renderPlan),
    renderPlanSummary: renderPlan ? {
      schemaVersion: renderPlan.schemaVersion,
      inputMode: renderPlan.inputMode,
      outputPath: renderPlan.output?.path,
      ffmpegPreview: renderPlan.ffmpeg?.preview
    } : null
  };
}

function createLog(progress) {
  if (progress < 30) return 'Resolving local media paths';
  if (progress < 60) return 'Preparing frames and transitions';
  if (progress < 100) return 'Encoding local MP4 mock output';
  return 'Local render complete';
}

module.exports = {
  createLocalRenderJob,
  getLocalRenderJob
};
