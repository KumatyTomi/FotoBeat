import { describeEditIntensity, getEditIntensityLabel, normalizeEditIntensity } from './editIntensity.js';

const SECTION_ORDER = ['intro', 'build', 'drop', 'outro'];

export function buildBeatDirector(options = {}) {
  const { timeline, audioAnalysis, editIntensity = 55 } = options ?? {};
  const clips = Array.isArray(timeline?.clips) ? timeline.clips : [];
  const duration = Number.isFinite(timeline?.estimatedDuration) && timeline.estimatedDuration > 0
    ? timeline.estimatedDuration
    : estimateDuration(clips);
  const sections = SECTION_ORDER.map((sectionId) => buildSectionSummary(sectionId, clips)).filter((section) => section.clipCount > 0);
  const cutDensity = duration > 0 ? Number(((clips.length / duration) * 10).toFixed(2)) : 0;
  const normalizedIntensity = normalizeEditIntensity(editIntensity);
  const dropSection = sections.find((section) => section.id === 'drop') ?? null;

  return {
    ready: clips.length > 0,
    sectionCount: sections.length,
    clipCount: clips.length,
    duration,
    cutDensity,
    intensity: normalizedIntensity,
    intensityLabel: getEditIntensityLabel(normalizedIntensity),
    analysisMode: audioAnalysis?.analysisMode ?? audioAnalysis?.status ?? 'fallback',
    beatCount: audioAnalysis?.beats?.length ?? 0,
    sections,
    decisions: buildDirectorDecisions({ audioAnalysis, cutDensity, dropSection, editIntensity: normalizedIntensity })
  };
}

export function describeBeatDirector(director) {
  if (!director?.ready) return 'Beat Director czeka na timeline.';
  return `Beat Director: ${director.clipCount} klipów, ${director.sectionCount} sekcji, ${director.cutDensity} cięć / 10s, ${director.intensityLabel}.`;
}

function buildSectionSummary(sectionId, clips) {
  const sectionClips = clips.filter((clip) => (clip.section || 'build') === sectionId);
  const first = sectionClips[0];
  const last = sectionClips.at(-1);
  const averageEnergy = sectionClips.length
    ? Number((sectionClips.reduce((sum, clip) => sum + (clip.energy ?? 0), 0) / sectionClips.length).toFixed(2))
    : 0;

  return {
    id: sectionId,
    label: sectionLabel(sectionId),
    clipCount: sectionClips.length,
    start: first?.start ?? 0,
    end: last ? Number((last.start + last.duration).toFixed(2)) : 0,
    averageEnergy
  };
}

function buildDirectorDecisions({ audioAnalysis, cutDensity, dropSection, editIntensity }) {
  const decisions = [];

  decisions.push(audioAnalysis?.analysisMode === 'transient'
    ? 'Cięcia oparte o transienty audio.'
    : 'Cięcia używają fallbacku BPM/energii.');
  decisions.push(`Intensywność: ${describeEditIntensity(editIntensity)}.`);
  decisions.push(cutDensity >= 5
    ? 'Gęstość cięć jest agresywna.'
    : cutDensity >= 3
      ? 'Gęstość cięć jest dynamiczna.'
      : 'Gęstość cięć jest spokojna.');

  if (dropSection) {
    decisions.push(`Drop: ${dropSection.clipCount} klipów, energia ${Math.round(dropSection.averageEnergy * 100)}%.`);
  }

  return decisions;
}

function estimateDuration(clips) {
  const last = clips.at(-1);
  return last ? Number((last.start + last.duration).toFixed(2)) : 0;
}

function sectionLabel(sectionId) {
  const labels = {
    intro: 'Intro',
    build: 'Build',
    drop: 'Drop',
    outro: 'Outro'
  };
  return labels[sectionId] ?? sectionId;
}
