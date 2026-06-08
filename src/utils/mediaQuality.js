export function buildMediaQualityReport(mediaAssets, selectedFormat) {
  const items = mediaAssets.map((asset) => analyzeMediaQuality(asset, selectedFormat));
  const readyItems = items.filter((item) => item.status === 'ready');
  const averageScore = readyItems.length
    ? Math.round(readyItems.reduce((sum, item) => sum + item.score, 0) / readyItems.length)
    : 0;

  return {
    total: items.length,
    ready: readyItems.length,
    averageScore,
    duplicateGroups: detectDuplicateGroups(items),
    warnings: buildGlobalWarnings(items, selectedFormat),
    items
  };
}

export function analyzeMediaQuality(asset, selectedFormat) {
  const width = asset.width || 0;
  const height = asset.height || 0;
  const megapixels = Number(((width * height) / 1_000_000).toFixed(2));
  const aspectRatio = height ? Number((width / height).toFixed(3)) : 0;
  const targetRatio = selectedFormat.height ? selectedFormat.width / selectedFormat.height : 1;
  const ratioDelta = Math.abs(aspectRatio - targetRatio);
  const warnings = [];
  let score = 0;

  if (asset.status === 'ready') score += 20;
  else warnings.push('Plik nie jest gotowy do renderu.');

  if (width >= selectedFormat.width && height >= selectedFormat.height) score += 30;
  else if (width >= selectedFormat.width * 0.65 || height >= selectedFormat.height * 0.65) score += 18;
  else warnings.push('Rozdzielczość może być za niska dla wybranego formatu.');

  if (ratioDelta < 0.08) score += 25;
  else if (ratioDelta < 0.35) score += 14;
  else warnings.push('Proporcje zdjęcia mocno odbiegają od formatu eksportu.');

  if (megapixels >= 2) score += 15;
  else if (megapixels >= 1) score += 8;
  else warnings.push('Zdjęcie ma mało megapikseli.');

  if (asset.size > 120000) score += 10;
  else warnings.push('Bardzo mały plik może oznaczać mocną kompresję.');

  return {
    id: asset.id,
    name: asset.name,
    status: asset.status,
    width,
    height,
    orientation: asset.orientation,
    size: asset.size,
    megapixels,
    aspectRatio,
    score: Math.min(100, score),
    fingerprint: buildMediaFingerprint(asset),
    warnings
  };
}

export function buildMediaFingerprint(asset) {
  return `${asset.name}|${asset.size}|${asset.type || 'unknown'}`;
}

export function detectDuplicateGroups(items) {
  const byFingerprint = new Map();

  items.forEach((item) => {
    const group = byFingerprint.get(item.fingerprint) ?? [];
    group.push(item);
    byFingerprint.set(item.fingerprint, group);
  });

  return [...byFingerprint.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      fingerprint: group[0].fingerprint,
      count: group.length,
      names: group.map((item) => item.name)
    }));
}

function buildGlobalWarnings(items, selectedFormat) {
  const warnings = [];
  const readyCount = items.filter((item) => item.status === 'ready').length;
  const lowQualityCount = items.filter((item) => item.score < 55).length;
  const duplicateCount = detectDuplicateGroups(items).length;

  if (readyCount === 0 && items.length > 0) warnings.push('Żadne zdjęcie nie jest jeszcze gotowe do renderu.');
  if (lowQualityCount > 0) warnings.push(`${lowQualityCount} zdjęć ma niski score jakości.`);
  if (duplicateCount > 0) warnings.push(`Wykryto ${duplicateCount} grup potencjalnych duplikatów.`);
  if (selectedFormat.id === 'vertical' && items.some((item) => item.orientation === 'landscape')) {
    warnings.push('Format 9:16 ma zdjęcia poziome — możliwe mocne kadrowanie.');
  }

  return warnings;
}
