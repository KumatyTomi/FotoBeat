import { useEffect, useState } from 'react';
import { createRenderJob, patchRenderJob, RENDER_JOB_STATUS, RENDER_JOB_TARGET } from '../utils/renderJobModel.js';
import { clearRenderJobs, deleteRenderJob, loadRenderJobs, saveRenderJob } from '../utils/renderJobStorage.js';

export function useRenderJobs() {
  const [jobs, setJobs] = useState([]);
  const [jobsState, setJobsState] = useState({
    status: 'idle',
    message: 'Render jobs ready.'
  });

  useEffect(() => {
    let cancelled = false;

    loadRenderJobs()
      .then((loadedJobs) => {
        if (!cancelled) setJobs(loadedJobs);
      })
      .catch(() => {
        if (!cancelled) setJobsState({ status: 'error', message: 'Nie udało się wczytać render jobs.' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function addSequenceZipJob({ projectName, format, preset, timelineDuration, sequenceId }) {
    const job = createRenderJob({
      projectName,
      target: RENDER_JOB_TARGET.ZIP_SEQUENCE,
      profileId: 'zip-frame-sequence',
      format,
      preset,
      timelineDuration,
      sequenceId
    });
    const readyJob = patchRenderJob(job, {
      status: RENDER_JOB_STATUS.READY,
      progress: 100,
      message: 'Frame sequence ZIP job completed.'
    });

    await saveRenderJob(readyJob);
    setJobs((current) => [readyJob, ...current].slice(0, 20));
    return readyJob;
  }

  async function addMp4PlanJob({ projectName, format, preset, timelineDuration, sequenceId, plan }) {
    const job = createRenderJob({
      projectName,
      target: RENDER_JOB_TARGET.MP4_FFMPEG,
      profileId: plan.profileId,
      format,
      preset,
      timelineDuration,
      sequenceId
    });
    const plannedJob = patchRenderJob(job, {
      status: plan.status === 'blocked' ? RENDER_JOB_STATUS.ERROR : RENDER_JOB_STATUS.QUEUED,
      progress: plan.status === 'blocked' ? 0 : 5,
      message: plan.status === 'blocked' ? plan.validation.summary : 'MP4 plan ready for ffmpeg.wasm.',
      error: plan.status === 'blocked' ? plan.validation.blockers.join(' ') : '',
      output: plan
    });

    await saveRenderJob(plannedJob);
    setJobs((current) => [plannedJob, ...current].slice(0, 20));
    return plannedJob;
  }

  async function removeJob(jobId) {
    await deleteRenderJob(jobId);
    setJobs((current) => current.filter((job) => job.id !== jobId));
  }

  async function clearJobs() {
    await clearRenderJobs();
    setJobs([]);
    setJobsState({ status: 'idle', message: 'Render jobs cleared.' });
  }

  return {
    jobs,
    jobsState,
    addSequenceZipJob,
    addMp4PlanJob,
    removeJob,
    clearJobs
  };
}
