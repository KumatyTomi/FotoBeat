export const DEFAULT_EDIT_INTENSITY = 55;

export function normalizeEditIntensity(value = DEFAULT_EDIT_INTENSITY) {
  if (value === null || value === undefined || value === '') return DEFAULT_EDIT_INTENSITY;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return DEFAULT_EDIT_INTENSITY;
  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

export function getEditIntensityLabel(value = DEFAULT_EDIT_INTENSITY) {
  const intensity = normalizeEditIntensity(value);
  if (intensity < 35) return 'spokojnie';
  if (intensity < 70) return 'dynamicznie';
  return 'agresywnie';
}

export function clipDurationScaleFromIntensity(value = DEFAULT_EDIT_INTENSITY) {
  const intensity = normalizeEditIntensity(value);
  return Number((1.65 - intensity * 0.011).toFixed(2));
}

export function intensityFromClipDurationScale(scale = 1) {
  const numericScale = Number(scale);
  if (!Number.isFinite(numericScale)) return DEFAULT_EDIT_INTENSITY;
  return normalizeEditIntensity((1.65 - numericScale) / 0.011);
}

export function describeEditIntensity(value = DEFAULT_EDIT_INTENSITY) {
  const intensity = normalizeEditIntensity(value);
  const label = getEditIntensityLabel(intensity);
  const scale = clipDurationScaleFromIntensity(intensity);
  return `${label} · ${intensity}/100 · tempo ×${scale}`;
}
