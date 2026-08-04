export const STORAGE_KEY = 'fotobeat.project.v1';

export const DEFAULT_PROJECT = {
  name: 'Nowy projekt FotoBeat',
  format: 'vertical',
  preset: 'neonPulse',
  notes: '',
  snapshots: [],
  clipDurationScale: 1
};

export function loadProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PROJECT, ...JSON.parse(raw) } : DEFAULT_PROJECT;
  } catch {
    return DEFAULT_PROJECT;
  }
}

export function buildProjectExportPayload({
  project,
  timeline,
  mediaAssets,
  selectedMediaAssets,
  selectedAssetIds,
  pinnedAssetsByClip,
  selectedFormat,
  audio,
  scoreMediaAsset
}) {
  return {
    schema: 'fotobeat.project.v1',
    exportedAt: new Date().toISOString(),
    project,
    timeline,
    media: {
      imageCount: mediaAssets.length,
      selectedImageCount: selectedMediaAssets.length,
      selectedOrder: selectedAssetIds,
      pinnedAssetsByClip,
      selectedImages: selectedMediaAssets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        size: asset.size,
        width: asset.width,
        height: asset.height,
        orientation: asset.orientation,
        status: asset.status,
        score: scoreMediaAsset(asset, selectedFormat)
      })),
      audioName: audio?.name ?? null
    }
  };
}

export function parseProjectFile(text) {
  const parsed = JSON.parse(text);

  if (parsed.schema !== 'fotobeat.project.v1' || !parsed.project) {
    throw new Error('To nie jest poprawny plik projektu FotoBeat.');
  }

  return parsed;
}

export function remapImportedMedia(importedMedia = {}, currentMediaAssets = []) {
  const safeImportedMedia = normalizeImportedMedia(importedMedia);
  const lookups = buildCurrentMediaLookups(currentMediaAssets);
  const importedById = new Map((safeImportedMedia.selectedImages ?? []).map((asset) => [asset.id, asset]));

  const selectedOrder = uniqueIds(safeImportedMedia.selectedOrder ?? [])
    .map((assetId) => lookups.assetsById.get(assetId) ?? findCurrentAssetForImportedImage(importedById.get(assetId), lookups))
    .filter(Boolean)
    .map((asset) => asset.id);

  const fallbackOrder = (safeImportedMedia.selectedImages ?? [])
    .map((asset) => findCurrentAssetForImportedImage(asset, lookups))
    .filter(Boolean)
    .map((asset) => asset.id);

  const finalOrder = selectedOrder.length ? uniqueIds(selectedOrder) : uniqueIds(fallbackOrder);
  const pinnedAssetsByClip = {};

  Object.entries(safeImportedMedia.pinnedAssetsByClip ?? {}).forEach(([clipNumber, importedAssetId]) => {
    const matchedAsset = lookups.assetsById.get(importedAssetId) ?? findCurrentAssetForImportedImage(importedById.get(importedAssetId), lookups);

    if (matchedAsset) {
      pinnedAssetsByClip[clipNumber] = matchedAsset.id;
    }
  });

  return {
    selectedOrder: finalOrder,
    pinnedAssetsByClip,
    report: buildImportedMediaReport(safeImportedMedia, currentMediaAssets)
  };
}

export function safeFilename(value) {
  return (value || 'fotobeat-project')
    .toLowerCase()
    .replace(/[^a-z0-9ąćęłńóśźż_-]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildImportedMediaReport(importedMedia = {}, currentMediaAssets = []) {
  const safeImportedMedia = normalizeImportedMedia(importedMedia);
  const lookups = buildCurrentMediaLookups(currentMediaAssets);
  const expectedImages = buildExpectedImportedImages(safeImportedMedia);
  const importedById = new Map(expectedImages.filter((asset) => asset.id).map((asset) => [asset.id, asset]));
  const matchedImages = [];
  const missingImages = [];

  expectedImages.forEach((asset) => {
    const matchedAsset = findCurrentAssetForImportedImage(asset, lookups);
    const item = normalizeImportedMediaItem(asset, matchedAsset);

    if (matchedAsset) {
      matchedImages.push(item);
    } else {
      missingImages.push(item);
    }
  });

  const missingPinnedClips = Object.entries(safeImportedMedia.pinnedAssetsByClip ?? {})
    .map(([clipIndex, importedAssetId]) => {
      const importedAsset = importedById.get(importedAssetId) ?? { id: importedAssetId, name: importedAssetId };
      const matchedAsset = lookups.assetsById.get(importedAssetId) ?? findCurrentAssetForImportedImage(importedAsset, lookups);

      return matchedAsset ? null : {
        clipIndex,
        assetId: importedAssetId,
        name: importedAsset.name || importedAssetId
      };
    })
    .filter(Boolean);

  return {
    expectedImageCount: expectedImages.length,
    matchedImageCount: matchedImages.length,
    missingImageCount: missingImages.length,
    matchedImages,
    missingImages,
    missingPinnedClips,
    ready: missingImages.length === 0 && missingPinnedClips.length === 0
  };
}

function buildCurrentMediaLookups(currentMediaAssets = []) {
  const mediaAssets = Array.isArray(currentMediaAssets) ? currentMediaAssets : [];

  return mediaAssets.reduce((lookups, asset) => {
    if (asset?.id) lookups.assetsById.set(asset.id, asset);

    if (asset?.name) {
      const candidates = lookups.assetsByName.get(asset.name) ?? [];
      candidates.push(asset);
      lookups.assetsByName.set(asset.name, candidates);
    }

    return lookups;
  }, { assetsById: new Map(), assetsByName: new Map() });
}

function normalizeImportedMedia(importedMedia) {
  const media = importedMedia && typeof importedMedia === 'object' ? importedMedia : {};

  return {
    selectedOrder: Array.isArray(media.selectedOrder) ? media.selectedOrder : [],
    selectedImages: Array.isArray(media.selectedImages) ? media.selectedImages.filter(Boolean) : [],
    pinnedAssetsByClip: media.pinnedAssetsByClip && typeof media.pinnedAssetsByClip === 'object'
      ? media.pinnedAssetsByClip
      : {}
  };
}

function buildExpectedImportedImages(importedMedia = {}) {
  const selectedImages = Array.isArray(importedMedia.selectedImages)
    ? importedMedia.selectedImages.filter(Boolean)
    : [];
  const importedById = new Map(selectedImages.filter((asset) => asset.id).map((asset) => [asset.id, asset]));
  const selectedOrderFallbacks = uniqueIds(importedMedia.selectedOrder ?? [])
    .filter((assetId) => !importedById.has(assetId))
    .map((assetId) => ({ id: assetId, name: assetId }));

  return uniqueImportedMediaItems([...selectedImages, ...selectedOrderFallbacks]);
}

function uniqueImportedMediaItems(items) {
  const seen = new Set();

  return items.filter((item, index) => {
    const key = item.id || `${item.name || 'unknown'}::${item.size ?? 'unknown-size'}::${index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findCurrentAssetForImportedImage(importedAsset, lookups) {
  if (!importedAsset) return null;

  if (importedAsset.id && lookups.assetsById.has(importedAsset.id)) {
    return lookups.assetsById.get(importedAsset.id);
  }

  const candidates = importedAsset.name ? lookups.assetsByName.get(importedAsset.name) ?? [] : [];
  if (candidates.length === 0) return null;

  return candidates.find((asset) => Number.isFinite(importedAsset.size) && asset.size === importedAsset.size) ?? candidates[0];
}

function normalizeImportedMediaItem(importedAsset, matchedAsset = null) {
  return {
    id: importedAsset.id ?? null,
    name: importedAsset.name || importedAsset.id || 'unknown-media',
    size: Number.isFinite(importedAsset.size) ? importedAsset.size : null,
    width: Number.isFinite(importedAsset.width) ? importedAsset.width : null,
    height: Number.isFinite(importedAsset.height) ? importedAsset.height : null,
    matchedAssetId: matchedAsset?.id ?? null,
    matchedAssetName: matchedAsset?.name ?? null
  };
}

function uniqueIds(ids) {
  return [...new Set(ids.filter(Boolean))];
}
