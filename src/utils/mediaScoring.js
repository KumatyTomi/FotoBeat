export function buildMediaFingerprint(file) {
  return [file.name, file.size, file.type || 'unknown', file.lastModified || 0].join('::');
}

export function buildMediaId(file, duplicateIndex = 0) {
  const fingerprint = buildMediaFingerprint(file);
  return duplicateIndex > 0 ? `${fingerprint}::duplicate-${duplicateIndex + 1}` : fingerprint;
}

export function getOrientation(width, height) {
  if (!width || !height) return 'unknown';
  if (Math.abs(width - height) < Math.max(width, height) * 0.05) return 'square';
  return width > height ? 'landscape' : 'portrait';
}

export function scoreMediaAsset(asset, selectedFormat) {
  let score = 0;

  if (asset.status === 'ready') score += 25;
  if (asset.width >= 1080 && asset.height >= 1080) score += 25;
  if (asset.width >= selectedFormat.width * 0.55 || asset.height >= selectedFormat.height * 0.55) score += 15;
  if (isOrientationFit(asset.orientation, selectedFormat.id)) score += 25;
  if (asset.size > 120000) score += 10;

  return Math.min(100, score);
}

export function resolveMediaForClip(clipIndex, selectedMediaAssets, pinnedAssetsByClip) {
  const pinnedAssetId = pinnedAssetsByClip[clipIndex];
  const pinnedAsset = selectedMediaAssets.find((asset) => asset.id === pinnedAssetId);

  if (pinnedAsset) return pinnedAsset;
  return selectedMediaAssets[(clipIndex - 1) % Math.max(selectedMediaAssets.length, 1)];
}

export function getPinnedLabel(assetId, pinnedAssetsByClip) {
  const clipNumbers = Object.entries(pinnedAssetsByClip)
    .filter(([, pinnedAssetId]) => pinnedAssetId === assetId)
    .map(([clipNumber]) => clipNumber);

  return clipNumbers.length ? `Klip ${clipNumbers.join(', ')}` : '';
}

function isOrientationFit(orientation, formatId) {
  if (formatId === 'vertical') return orientation === 'portrait';
  if (formatId === 'wide') return orientation === 'landscape';
  if (formatId === 'square') return orientation === 'square' || orientation === 'portrait';
  return false;
}
