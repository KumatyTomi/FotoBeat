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

export function remapImportedMedia(importedMedia = {}, currentMediaAssets) {
  const assetsById = new Map(currentMediaAssets.map((asset) => [asset.id, asset]));
  const assetsByName = new Map(currentMediaAssets.map((asset) => [asset.name, asset]));
  const importedById = new Map((importedMedia.selectedImages ?? []).map((asset) => [asset.id, asset]));

  const selectedOrder = uniqueIds(importedMedia.selectedOrder ?? [])
    .map((assetId) => assetsById.get(assetId) ?? assetsByName.get(importedById.get(assetId)?.name))
    .filter(Boolean)
    .map((asset) => asset.id);

  const fallbackOrder = (importedMedia.selectedImages ?? [])
    .map((asset) => assetsById.get(asset.id) ?? assetsByName.get(asset.name))
    .filter(Boolean)
    .map((asset) => asset.id);

  const finalOrder = selectedOrder.length ? selectedOrder : uniqueIds(fallbackOrder);
  const pinnedAssetsByClip = {};

  Object.entries(importedMedia.pinnedAssetsByClip ?? {}).forEach(([clipNumber, importedAssetId]) => {
    const importedAsset = importedById.get(importedAssetId);
    const matchedAsset = assetsById.get(importedAssetId) ?? assetsByName.get(importedAsset?.name);

    if (matchedAsset) {
      pinnedAssetsByClip[clipNumber] = matchedAsset.id;
    }
  });

  return {
    selectedOrder: finalOrder,
    pinnedAssetsByClip
  };
}

export function safeFilename(value) {
  return (value || 'fotobeat-project')
    .toLowerCase()
    .replace(/[^a-z0-9ąćęłńóśźż_-]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueIds(ids) {
  return [...new Set(ids.filter(Boolean))];
}
