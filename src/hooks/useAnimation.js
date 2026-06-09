export const GUI_V3_TIMINGS = {
  profileSwitch: 420,
  drawer: 220,
  accordion: 180,
  premiumHover: 90,
  micro: 90
};

export function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

export function animateDeterministic({ duration = 220, steps = 9, onStep, onComplete }) {
  if (typeof window === 'undefined' || typeof onStep !== 'function') return () => {};

  let frame = 0;
  let canceled = false;
  const interval = duration / steps;

  function tick() {
    if (canceled) return;
    frame += 1;
    const progress = Math.min(1, frame / steps);
    onStep(easeOutCubic(progress), progress);

    if (progress >= 1) {
      onComplete?.();
      return;
    }

    window.setTimeout(tick, interval);
  }

  window.setTimeout(tick, interval);
  return () => {
    canceled = true;
  };
}
