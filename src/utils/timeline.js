import { EFFECT_PRESETS } from '../data/effects.js';

const DEFAULT_CLIP_COUNT = 8;
const MAX_CLIP_COUNT = 18;

export function buildDraftTimeline({ images, audio, format, preset, audioAnalysis, clipDurationScale = 1 }) {
  const effect = EFFECT_PRESETS.find((item) => item.id === preset) ?? EFFECT_PRESETS[0];
  const clipCount = Math.max(4, Math.min(images.length || DEFAULT_CLIP_COUNT, MAX_CLIP_COUNT));
  const beatGrid = buildBeatGrid({ audio, audioAnalysis, clipCount, clipDurationScale });

  const clips = Array.from({ length: clipCount }).map((_, index) => {
    const file = images[index % Math.max(images.length, 1)];
    const beat = beatGrid[index];
    const section = pickSection(index, clipCount);

    return {
      id: `clip-${index + 1}`,
      start: beat.start,
      duration: beat.duration,
      label: file?.name ?? `Kadr ${index + 1}`,
      effect: pickEffectVariant(effect.id, index, section),
      energy: beat.energy,
      section,
      format
    };
  });

  return {
    summary: buildSummary({ audio, audioAnalysis, clipCount, effect, clipDurationScale }),
    format,
    preset: effect.id,
    clipDurationScale,
    estimatedDuration: Number((clips.at(-1)?.start + clips.at(-1)?.duration || 0).toFixed(1)),
    clips
  };
}

function buildBeatGrid({ audio, audioAnalysis, clipCount, clipDurationScale }) {
  const safeScale = Math.min(2, Math.max(0.5, Number(clipDurationScale) || 1));

  if (audioAnalysis?.beats?.length) {
    return audioAnalysis.beats.slice(0, clipCount).map((beat, index, beats) => {
      const next = beats[index + 1];
      const duration = next ? next.time - beat.time : audioAnalysis.averageBeatStep;

      return {
        start: Number((beat.time * safeScale).toFixed(2)),
        duration: Number(Math.max(0.35, duration * safeScale).toFixed(2)),
        energy: beat.energy
      };
    });
  }

  const beatStep = (audio ? 1.5 : 2.0) * safeScale;
  return Array.from({ length: clipCount }).map((_, index) => ({
    start: Number((index * beatStep).toFixed(1)),
    duration: Number(beatStep.toFixed(2)),
    energy: audio ? 0.66 : 0.42
  }));
}

function buildSummary({ audio, audioAnalysis, clipCount, effect, clipDurationScale }) {
  const scaleLabel = clipDurationScale !== 1 ? `, korekta klipu ×${clipDurationScale}` : '';

  if (audioAnalysis?.status === 'ready') {
    return `Audio: ${audio.name}. BPM ~${audioAnalysis.bpm}, ${clipCount} klipów, preset ${effect.name}, energia ${Math.round(audioAnalysis.energy * 100)}%${scaleLabel}.`;
  }

  if (audioAnalysis?.status === 'analyzing') {
    return `Analizuję audio: ${audio.name}. Timeline używa roboczej siatki do czasu zakończenia analizy${scaleLabel}.`;
  }

  if (audio) {
    return `Wykryto audio: ${audio.name}. Robocza siatka cięć zostanie zastąpiona beat mapą po analizie${scaleLabel}.`;
  }

  return `Brak audio. Timeline pokazuje poglądowe cięcia do dalszej analizy beatu${scaleLabel}.`;
}

function pickSection(index, clipCount) {
  const progress = index / Math.max(clipCount - 1, 1);

  if (progress < 0.18) return 'intro';
  if (progress < 0.68) return 'build';
  if (progress < 0.88) return 'drop';
  return 'outro';
}

function pickEffectVariant(preset, index, section) {
  const variants = {
    neonPulse: ['zoom-in', 'flash-cut', 'neon-blur', 'beat-shake'],
    smokeCut: ['smoke-left', 'soft-fade', 'depth-blur', 'fog-wipe'],
    matrixGlitch: ['rgb-split', 'scanline', 'data-rain', 'glitch-pop'],
    sinCity: ['hard-contrast', 'red-accent', 'noir-fade', 'grain-pulse'],
    spiralZoom: ['spiral-in', 'rotate-push', 'center-warp', 'drop-tunnel'],
    dreamFade: ['soft-glow', 'slow-fade', 'light-leak', 'dream-blur']
  };

  const list = variants[preset] ?? variants.neonPulse;
  const offset = section === 'drop' ? 2 : section === 'outro' ? 1 : 0;
  return list[(index + offset) % list.length];
}
