const { randomUUID } = require('node:crypto');

const jobs = new Map();

function createLocalRenderJob(payload = {}) {
  const job = {
    id: `local-render-${randomUUID()}`,
    status: 'queued',
    progress: 0,
    manifest: payload.manifest ?? null,
    outputFolder: payload.outputFolder ?? null,
    outputPath: null,
    logs: ['Local desktop render job queued'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  jobs.set(job.id, job);
  scheduleMockProgress(job.id);
  return job;
}

function getLocalRenderJob(jobId) {
  return jobs.get(jobId) ?? null;
}

function scheduleMockProgress(jobId) {
  const interval = setInterval(() => {
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
      job.outputPath = job.outputFolder
        ? `${job.outputFolder}/fotobeat-${job.id}.mp4`
        : `mock://desktop-render/${job.id}.mp4`;
      clearInterval(interval);
    }

    jobs.set(jobId, job);
  }, 1200);
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
