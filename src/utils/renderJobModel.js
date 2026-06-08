export const RENDER_JOB_STATUS = {
  QUEUED: 'queued',
  PREPARING: 'preparing',
  RENDERING_FRAMES: 'rendering-frames',
  PACKAGING: 'packaging',
  ENCODING: 'encoding',
  READY: 'ready',
  ERROR: 'error',
  CANCELLED: 'cancelled'
};

export const RENDER_JOB_TARGET = {
  WEBM_MEDIARECORDER: 'webm-mediarecorder',
  PNG_SEQUENCE: 'png-sequence',
  ZIP_SEQUENCE: 'zip-sequence',
  MP4_FFMPEG: 'mp4-ffmpeg'
};

export function createRenderJob({
  projectName,
  target,
  profileId,
  format,
  preset,
  timelineDuration,
  sequenceId = '',
  exportId = ''
}) {
  const now = new Date().toISOString();

  return {
    id: `job-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    createdAt: now,
    updatedAt: now,
    completedAt: '',
    projectName,
    target,
    profileId,
    format,
    preset,
    timelineDuration,
    sequenceId,
    exportId,
    status: RENDER_JOB_STATUS.QUEUED,
    progress: 0,
    message: 'Render job queued.',
    error: '',
    output: null
  };
}

export function patchRenderJob(job, patch) {
  return {
    ...job,
    ...patch,
    updatedAt: new Date().toISOString(),
    completedAt: isTerminalStatus(patch.status) ? new Date().toISOString() : job.completedAt
  };
}

export function isTerminalStatus(status) {
  return [
    RENDER_JOB_STATUS.READY,
    RENDER_JOB_STATUS.ERROR,
    RENDER_JOB_STATUS.CANCELLED
  ].includes(status);
}

export function summarizeRenderJob(job) {
  if (!job) return 'Brak render job.';
  return `${job.target} · ${job.status} · ${job.progress}% · ${job.projectName}`;
}
