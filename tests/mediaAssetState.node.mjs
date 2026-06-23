import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMediaDescriptors, getNewAssetIds, mergeSelectedAssetIds, prunePinnedAssetsByClip } from '../src/utils/mediaAssetState.js';
import { buildMediaFingerprint, buildMediaId } from '../src/utils/mediaScoring.js';

function file(name, size, lastModified = 1000, type = 'image/jpeg') {
  return { name, size, lastModified, type };
}

test('buildMediaFingerprint is stable for the same file metadata', () => {
  const photo = file('photo-a.jpg', 1200, 111);

  assert.equal(buildMediaFingerprint(photo), 'photo-a.jpg::1200::image/jpeg::111');
  assert.equal(buildMediaId(photo), buildMediaFingerprint(photo));
});

test('buildMediaDescriptors keeps stable ids and marks true duplicate fingerprints', () => {
  const first = file('photo-a.jpg', 1200, 111);
  const duplicate = file('photo-a.jpg', 1200, 111);
  const second = file('photo-b.jpg', 2200, 222);

  const descriptors = buildMediaDescriptors([first, duplicate, second]);

  assert.equal(descriptors[0].id, 'photo-a.jpg::1200::image/jpeg::111');
  assert.equal(descriptors[1].id, 'photo-a.jpg::1200::image/jpeg::111::duplicate-2');
  assert.equal(descriptors[2].id, 'photo-b.jpg::2200::image/jpeg::222');
});

test('mergeSelectedAssetIds keeps manual order and appends only new assets', () => {
  const currentSelection = ['b', 'a'];
  const nextIds = ['a', 'b', 'c'];
  const previousKnownIds = new Set(['a', 'b']);
  const newIds = getNewAssetIds(nextIds, previousKnownIds);

  assert.deepEqual(newIds, ['c']);
  assert.deepEqual(mergeSelectedAssetIds(currentSelection, nextIds, newIds), ['b', 'a', 'c']);
});

test('mergeSelectedAssetIds removes deleted assets but preserves remaining order', () => {
  assert.deepEqual(
    mergeSelectedAssetIds(['c', 'a', 'b'], ['a', 'c'], [], { isInitialLoad: false }),
    ['c', 'a']
  );
});

test('mergeSelectedAssetIds selects all assets on initial load', () => {
  assert.deepEqual(
    mergeSelectedAssetIds([], ['a', 'b'], ['a', 'b'], { isInitialLoad: true }),
    ['a', 'b']
  );
});

test('prunePinnedAssetsByClip removes pins only for missing assets', () => {
  const currentPins = {
    1: 'a',
    2: 'deleted',
    3: 'c'
  };

  assert.deepEqual(prunePinnedAssetsByClip(currentPins, new Set(['a', 'b', 'c'])), {
    1: 'a',
    3: 'c'
  });
});
