import { buildMediaFingerprint, buildMediaId } from './mediaScoring.js';

export function buildMediaDescriptors(images) {
  const duplicateCounts = new Map();

  return images.map((file) => {
    const fingerprint = buildMediaFingerprint(file);
    const duplicateIndex = duplicateCounts.get(fingerprint) ?? 0;
    duplicateCounts.set(fingerprint, duplicateIndex + 1);

    return {
      id: buildMediaId(file, duplicateIndex),
      fingerprint,
      name: file.name,
      size: file.size,
      type: file.type,
      file
    };
  });
}

export function getNewAssetIds(nextIds, previousKnownIds) {
  return nextIds.filter((assetId) => !previousKnownIds.has(assetId));
}

export function mergeSelectedAssetIds(currentSelection, nextIds, newIds, { isInitialLoad = false } = {}) {
  if (isInitialLoad) return nextIds;

  const nextIdSet = new Set(nextIds);
  const retainedSelection = currentSelection.filter((assetId) => nextIdSet.has(assetId));
  const retainedSet = new Set(retainedSelection);
  const appendedNewIds = newIds.filter((assetId) => !retainedSet.has(assetId));

  return [...retainedSelection, ...appendedNewIds];
}

export function prunePinnedAssetsByClip(pinnedAssetsByClip, activeAssetIds) {
  const activeIdSet = activeAssetIds instanceof Set ? activeAssetIds : new Set(activeAssetIds);

  return Object.fromEntries(
    Object.entries(pinnedAssetsByClip).filter(([, assetId]) => activeIdSet.has(assetId))
  );
}

export function didObjectShapeChange(previous, next) {
  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);

  if (previousKeys.length !== nextKeys.length) return true;

  return previousKeys.some((key) => previous[key] !== next[key]);
}
