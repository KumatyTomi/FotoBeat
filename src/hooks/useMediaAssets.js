import { useEffect, useMemo, useRef, useState } from 'react';
import { estimateImageSharpness } from '../utils/imageSharpness.js';
import { buildMediaDescriptors, didObjectShapeChange, getNewAssetIds, mergeSelectedAssetIds, prunePinnedAssetsByClip } from '../utils/mediaAssetState.js';
import { getOrientation, scoreMediaAsset } from '../utils/mediaScoring.js';

export function useMediaAssets(images, selectedFormat) {
  const [mediaAssets, setMediaAssets] = useState([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [pinnedAssetsByClip, setPinnedAssetsByClip] = useState({});
  const objectUrlsRef = useRef(new Map());
  const knownAssetIdsRef = useRef(new Set());
  const loadingAssetIdsRef = useRef(new Set());

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    knownAssetIdsRef.current.clear();
    loadingAssetIdsRef.current.clear();
  }, []);

  useEffect(() => {
    if (images.length === 0) {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
      knownAssetIdsRef.current.clear();
      loadingAssetIdsRef.current.clear();
      setMediaAssets([]);
      setSelectedAssetIds([]);
      setPinnedAssetsByClip({});
      return;
    }

    const descriptors = buildMediaDescriptors(images);
    const nextIds = descriptors.map((asset) => asset.id);
    const nextIdSet = new Set(nextIds);
    const previousKnownIds = knownAssetIdsRef.current;
    const newIds = getNewAssetIds(nextIds, previousKnownIds);
    const isInitialLoad = previousKnownIds.size === 0;

    objectUrlsRef.current.forEach((url, assetId) => {
      if (!nextIdSet.has(assetId)) {
        URL.revokeObjectURL(url);
        objectUrlsRef.current.delete(assetId);
        loadingAssetIdsRef.current.delete(assetId);
      }
    });

    setMediaAssets((current) => {
      const currentById = new Map(current.map((asset) => [asset.id, asset]));

      return descriptors.map((descriptor) => {
        const existing = currentById.get(descriptor.id);
        const url = objectUrlsRef.current.get(descriptor.id) ?? URL.createObjectURL(descriptor.file);
        objectUrlsRef.current.set(descriptor.id, url);

        if (existing) {
          return {
            ...existing,
            ...descriptor,
            url
          };
        }

        return {
          ...descriptor,
          url,
          status: 'loading',
          width: 0,
          height: 0,
          orientation: 'unknown',
          sharpness: { score: null, label: 'unknown' },
          image: null
        };
      });
    });

    setSelectedAssetIds((current) => mergeSelectedAssetIds(current, nextIds, newIds, { isInitialLoad }));

    setPinnedAssetsByClip((current) => {
      const next = prunePinnedAssetsByClip(current, nextIdSet);
      return didObjectShapeChange(current, next) ? next : current;
    });

    knownAssetIdsRef.current = nextIdSet;
  }, [images]);

  useEffect(() => {
    mediaAssets
      .filter((asset) => asset.status === 'loading' && !loadingAssetIdsRef.current.has(asset.id))
      .forEach((asset) => {
        loadingAssetIdsRef.current.add(asset.id);
        const image = new Image();

        image.onload = () => {
          const sharpness = estimateImageSharpness(image);

          loadingAssetIdsRef.current.delete(asset.id);
          setMediaAssets((current) => current.map((item) => (
            item.id === asset.id
              ? {
                ...item,
                status: 'ready',
                width: image.naturalWidth,
                height: image.naturalHeight,
                orientation: getOrientation(image.naturalWidth, image.naturalHeight),
                sharpness,
                image
              }
              : item
          )));
        };

        image.onerror = () => {
          loadingAssetIdsRef.current.delete(asset.id);
          setMediaAssets((current) => current.map((item) => (
            item.id === asset.id ? { ...item, status: 'error' } : item
          )));
        };

        image.src = asset.url;
      });
  }, [mediaAssets]);

  const mediaById = useMemo(() => new Map(mediaAssets.map((asset) => [asset.id, asset])), [mediaAssets]);

  const scoredMediaAssets = useMemo(() => mediaAssets.map((asset) => ({
    ...asset,
    score: scoreMediaAsset(asset, selectedFormat)
  })), [mediaAssets, selectedFormat]);

  const selectedMediaAssets = useMemo(() => {
    const selected = selectedAssetIds.map((assetId) => mediaById.get(assetId)).filter(Boolean);
    return selected.length ? selected : mediaAssets;
  }, [mediaAssets, mediaById, selectedAssetIds]);

  useEffect(() => {
    const activeIds = new Set(selectedMediaAssets.map((asset) => asset.id));

    setPinnedAssetsByClip((current) => {
      const next = prunePinnedAssetsByClip(current, activeIds);
      return didObjectShapeChange(current, next) ? next : current;
    });
  }, [selectedMediaAssets]);

  function toggleMediaAsset(assetId) {
    setSelectedAssetIds((current) => {
      if (current.includes(assetId)) {
        const next = current.filter((id) => id !== assetId);
        return next.length ? next : current;
      }

      return [...current, assetId];
    });
  }

  function selectAllMedia() {
    setSelectedAssetIds(mediaAssets.map((asset) => asset.id));
  }

  function moveMediaAsset(assetId, direction) {
    setSelectedAssetIds((current) => {
      const index = current.indexOf(assetId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      const [asset] = next.splice(index, 1);
      next.splice(nextIndex, 0, asset);
      return next;
    });
  }

  function pinAssetToClip(assetId, clipIndex) {
    setPinnedAssetsByClip((current) => ({
      ...current,
      [clipIndex]: assetId
    }));
  }

  function clearPinnedClip(clipIndex) {
    setPinnedAssetsByClip((current) => {
      const next = { ...current };
      delete next[clipIndex];
      return next;
    });
  }

  return {
    mediaAssets,
    scoredMediaAssets,
    selectedAssetIds,
    selectedMediaAssets,
    pinnedAssetsByClip,
    setSelectedAssetIds,
    setPinnedAssetsByClip,
    toggleMediaAsset,
    selectAllMedia,
    moveMediaAsset,
    pinAssetToClip,
    clearPinnedClip
  };
}
