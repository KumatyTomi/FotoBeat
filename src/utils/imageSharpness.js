const SHARPNESS_SAMPLE_SIZE = 48;

export function estimateImageSharpness(image, sampleSize = SHARPNESS_SAMPLE_SIZE) {
  if (!image?.naturalWidth || !image?.naturalHeight || typeof document === 'undefined') {
    return buildSharpnessResult(null);
  }

  try {
    const width = Math.max(3, Math.min(sampleSize, image.naturalWidth));
    const height = Math.max(3, Math.min(sampleSize, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) return buildSharpnessResult(null);

    ctx.drawImage(image, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    const luma = buildLumaValues(data);

    return buildSharpnessResult(scoreSharpnessFromLuma(luma, width, height));
  } catch {
    return buildSharpnessResult(null);
  }
}

export function scoreSharpnessFromLuma(lumaValues, width, height) {
  if (!Array.isArray(lumaValues) && !(lumaValues instanceof Uint8ClampedArray)) return 0;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 3 || height < 3) return 0;

  let energy = 0;
  let samples = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const center = lumaValues[index] ?? 0;
      const laplacian = Math.abs(
        center * 4
        - (lumaValues[index - 1] ?? 0)
        - (lumaValues[index + 1] ?? 0)
        - (lumaValues[index - width] ?? 0)
        - (lumaValues[index + width] ?? 0)
      );

      energy += laplacian;
      samples += 1;
    }
  }

  if (samples === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((energy / samples) * 0.9)));
}

export function classifySharpness(score) {
  if (!Number.isFinite(score)) return 'unknown';
  if (score >= 62) return 'sharp';
  if (score >= 34) return 'soft';
  return 'blurry';
}

export function describeSharpness(score) {
  const label = classifySharpness(score);
  if (label === 'sharp') return `ostre · ${score}/100`;
  if (label === 'soft') return `miękkie · ${score}/100`;
  if (label === 'blurry') return `rozmyte · ${score}/100`;
  return 'ostrość nieznana';
}

function buildSharpnessResult(score) {
  const normalizedScore = Number.isFinite(score) ? score : null;

  return {
    score: normalizedScore,
    label: classifySharpness(normalizedScore)
  };
}

function buildLumaValues(data) {
  const luma = [];

  for (let index = 0; index < data.length; index += 4) {
    luma.push(Math.round(data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722));
  }

  return luma;
}
