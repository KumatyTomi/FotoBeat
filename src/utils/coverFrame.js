import { safeFilename } from './projectExport.js';

const COVER_FRAME_PROGRESS = 0.42;

const SECTION_SCORE = {
  drop: 1,
  build: 0.35,
  intro: 0.1,
  outro: 0
};

export function pickCoverFrameTime({ timeline, currentTime = 0, strategyId = 'smart' } = {}) {
  const clips = normalizeClips(timeline?.clips);
  const totalDuration = normalizeDuration(timeline?.estimatedDuration, clips);

  if (strategyId === 'current') {
    return normalizeCoverTime(currentTime, totalDuration);
  }

  const clip = strategyId === 'drop'
    ? clips.find((item) => item.section === 'drop') ?? pickSmartCoverClip(clips)
    : pickSmartCoverClip(clips);

  if (!clip) return normalizeCoverTime(currentTime, totalDuration);

  return normalizeCoverTime(clip.start + clip.duration * COVER_FRAME_PROGRESS, totalDuration);
}

export function buildCoverFrameFileName({ projectName, formatId, time }) {
  const timeSlug = String(Number.isFinite(time) ? Number(time.toFixed(3)) : 0).replace('.', '-');
  return `${safeFilename(projectName)}-cover-${formatId || 'format'}-${timeSlug}.png`;
}

export function describeCoverFrame({ frameMeta, strategyId = 'smart' } = {}) {
  if (!frameMeta) return 'Cover nie został jeszcze wygenerowany.';
  const strategyLabel = strategyId === 'current' ? 'aktualny kadr' : strategyId === 'drop' ? 'pierwszy drop' : 'smart drop';
  return `Cover PNG gotowy: ${strategyLabel}, klip ${frameMeta.clipIndex}/${frameMeta.totalClips}, ${frameMeta.time}s.`;
}

function pickSmartCoverClip(clips) {
  return clips.reduce((best, clip) => {
    const score = (clip.energy ?? 0) + (SECTION_SCORE[clip.section] ?? 0);
    if (!best || score > best.score) return { clip, score };
    return best;
  }, null)?.clip ?? null;
}

function normalizeClips(clips = []) {
  return Array.isArray(clips)
    ? clips
      .map((clip, index) => ({
        ...clip,
        start: Number.isFinite(clip?.start) ? clip.start : index,
        duration: Number.isFinite(clip?.duration) && clip.duration > 0 ? clip.duration : 1,
        energy: Number.isFinite(clip?.energy) ? Math.max(0, Math.min(1, clip.energy)) : 0,
        section: clip?.section || 'build'
      }))
      .sort((a, b) => a.start - b.start)
    : [];
}

function normalizeDuration(duration, clips) {
  if (Number.isFinite(duration) && duration > 0) return duration;
  const lastClip = clips.at(-1);
  return lastClip ? lastClip.start + lastClip.duration : 1;
}

function normalizeCoverTime(time, totalDuration) {
  if (!Number.isFinite(time) || time < 0) return 0;
  if (!Number.isFinite(totalDuration) || totalDuration <= 0) return 0;
  return Number(Math.min(time, totalDuration).toFixed(3));
}
