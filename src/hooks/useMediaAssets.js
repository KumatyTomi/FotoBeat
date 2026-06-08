import { useEffect, useMemo, useState } from 'react';
import { buildMediaId, getOrientation, scoreMediaAsset } from '../utils/mediaScoring.js';

export function useMediaAssets(images, selectedFormat) {
  const [mediaAssets, setMediaAssets] = useState([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [pinnedAssetsByClip, setPinnedAssetsByClip] = useState({});

  useEffect(() => {
    if (images.length === 0) {
      setMediaAssets([]);
      setSelectedAssetIds([]);
      setPinnedAssetsByClip({});
      return undefined;
    }

    let cancelled = false;
    const nextAssets = images.map((file, index) => ({
      id: buildMediaId(file, index),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      url: URL.createObjectURL(file),
      status: 'loading',
      width: 0,
      height: 0,
      orientation: 'unknown',
      image: null
    }));

    setMediaAssets(nextAssets);
    setSelectedAssetIds(nextAssets.map((asset) => asset.id));
    setPinnedAssetsByClip({});

    nextAssets.forEach((asset) => {
      const image = new Image();

      image.onload = () => {
        if (cancelled) return;
        setMediaAssets((current) => current.map((item) => (
          item.id === asset.id
            ? {
              ...item,
              status: 'ready',
              width: image.naturalWidth,
              height: image.naturalHeight,
              orientation: getOrientation(image.naturalWidth, image.naturalHeight),
              image
            }
            : item
        )));
      };

      image.onerror = () => {
        if (cancelled) return;
        setMediaAssets((current) => current.map((item) => (
          item.id === asset.id ? { ...item, status: 'error' } : item
        )));
      };

      image.src = asset.url;
    });

    return () => {
      cancelled = true;
      nextAssets.forEach((asset) => URL.revokeObjectURL(asset.url));
    };
  }, [images]);

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
      const next = Object.fromEntries(
        Object.entries(current).filter(([, assetId]) => activeIds.has(assetId))
      );

      return Object.keys(next).length === Object.keys(current).length ? current : next;
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
