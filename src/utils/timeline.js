import { EFFECT_PRESETS } from '../data/effects.js';

const DEFAULT_CLIP_COUNT = 8;

export function buildDraftTimeline({ images, audio, preset }) {
  const effect = EFFECT_PRESETS.find((item) => item.id === preset) ?? EFFECT_PRESETS[0];
  const clipCount = Math.max(4, Math.min(images.length || DEFAULT_CLIP_COUNT, 16));
  const beatStep = audio ? 1.5 : 2.0;

  const clips = Array.from({ length: clipCount }).map((_, index) => {
    const file = images[index % Math.max(images.length, 1)];
    return {
      id: `clip-${index + 1}`,
      start: Number((index * beatStep).toFixed(1)),
      label: file?.name ?? `Kadr ${index + 1}`,
      effect: pickEffectVariant(effect.id, index)
    };
  });

  return {
    summary: audio
      ? `Wykryto audio: ${audio.name}. Robocza siatka: ${beatStep}s na cięcie.`
      : 'Brak audio. Timeline pokazuje poglądowe cięcia do dalszej analizy beatu.',
    clips
  };
}

function pickEffectVariant(preset, index) {
  const variants = {
    neonPulse: ['zoom-in', 'flash-cut', 'neon-blur', 'beat-shake'],
    smokeCut: ['smoke-left', 'soft-fade', 'depth-blur', 'fog-wipe'],
    matrixGlitch: ['rgb-split', 'scanline', 'data-rain', 'glitch-pop'],
    sinCity: ['hard-contrast', 'red-accent', 'noir-fade', 'grain-pulse']
  };

  const list = variants[preset] ?? variants.neonPulse;
  return list[index % list.length];
}
