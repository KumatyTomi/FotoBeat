const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { buildRenderPlan } = require('./renderPlan.cjs');

const jobs = new Map();

async function createLocalRenderJob(payload = {}) {
  const id = `local-render-${randomUUID()}`;
  const outputFolder = payload.outputFolder || path.join(os.homedir(), 'FotoBeat-renders');
  const jobFolder = path.join(outputFolder, id);

  const job = {
    id,
    status: 'queued',
    progress: 0,
    manifest: payload.manifest ?? null,
    renderPlan: null,
    outputFolder,
    jobFolder,
    manifestPath: path.join(jobFolder, 'manifest.fotobeat.json'),
    renderPlanPath: path.join(jobFolder, 'render-plan.json'),
    statusPath: path.join(jobFolder, 'render-job.json'),
    outputPath: null,
    logs: ['Local desktop render job queued'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await fs.mkdir(jobFolder, { recursive: true });
    job.renderPlan = buildRenderPlan(job);
    job.outputPath = job.renderPlan.output.path;
    await writeManifest(job);
    await writeRenderPlan(job);
    await writeJobStatus(job);
    job.logs.push(`Render workspace prepared: ${jobFolder}`);
    job.logs.push(`Render plan written: ${job.renderPlanPath}`);
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

    const nextProgress = Math.min(100, job.progress + 20);
    job.progress = nextProgress;
    job.status = nextProgress >= 100 ? 'done' : 'rendering';
    job.logs.push(createLog(nextProgress));
    job.updatedAt = new Date().toISOString();

    if (job.status === 'done') {
      await writeMockOutput(job);
      clearInterval(interval);
    }

    await writeJobStatus(job);
    jobs.set(jobId, job);
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
    '',
    'This placeholder marks where the final MP4 will be written by the local FFmpeg pipeline.',
    'Next implementation step: execute render-plan.json with native FFmpeg.'
  ].join('\n');

  await fs.writeFile(job.outputPath, content, 'utf8');
  job.logs.push(`Mock output written: ${job.outputPath}`);
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
