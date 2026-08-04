export const DEFAULT_RENDER_VARIANT_ID = 'hardBeat';

export const RENDER_VARIANTS = [
  {
    id: 'clean',
    label: 'Clean',
    description: 'Stabilny obraz, mniej glow i mniej ruchu.',
    motionScale: 0.45,
    glowScale: 0.55,
    scanlines: false,
    letterbox: false,
    tint: 'none'
  },
  {
    id: 'hardBeat',
    label: 'Hard Beat',
    description: 'Domyślny puls, mocny glow i reakcja na energię.',
    motionScale: 1,
    glowScale: 1,
    scanlines: true,
    letterbox: false,
    tint: 'none'
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    description: 'Spokojniejszy ruch, filmowy tint i subtelny letterbox.',
    motionScale: 0.7,
    glowScale: 0.72,
    scanlines: false,
    letterbox: true,
    tint: 'warm'
  }
];

export function getRenderVariant(variantId = DEFAULT_RENDER_VARIANT_ID) {
  return RENDER_VARIANTS.find((variant) => variant.id === variantId) ?? RENDER_VARIANTS.find((variant) => variant.id === DEFAULT_RENDER_VARIANT_ID);
}

export function describeRenderVariant(variantId = DEFAULT_RENDER_VARIANT_ID) {
  const variant = getRenderVariant(variantId);
  return `${variant.label}: ${variant.description}`;
}
