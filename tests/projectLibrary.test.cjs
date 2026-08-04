const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('project library persistence', () => {
  test('upserts project payloads and keeps newest entries first', () => {
    runModuleScript(`
      import { upsertProjectLibraryEntry } from './src/utils/projectLibrary.js';

      const payload = createPayload('project-a', 'Project A');
      const first = upsertProjectLibraryEntry([], payload, { id: 'project-a', savedAt: '2026-08-04T01:00:00.000Z' });
      const updated = upsertProjectLibraryEntry(first, createPayload('project-a', 'Project A v2'), { id: 'project-a', savedAt: '2026-08-04T02:00:00.000Z' });
      const withSecond = upsertProjectLibraryEntry(updated, createPayload('project-b', 'Project B'), { id: 'project-b', savedAt: '2026-08-04T03:00:00.000Z' });

      if (withSecond.length !== 2) throw new Error(\`Expected 2 entries, got \${withSecond.length}\`);
      if (withSecond[0].id !== 'project-b' || withSecond[1].name !== 'Project A v2') {
        throw new Error(\`Unexpected library order: \${JSON.stringify(withSecond)}\`);
      }
      if (withSecond[1].payload.project.libraryId !== 'project-a') {
        throw new Error('Library id was not written back into payload project.');
      }

      function createPayload(id, name) {
        return {
          schema: 'fotobeat.project.v1',
          exportedAt: '2026-08-04T00:00:00.000Z',
          project: { libraryId: id, name, format: 'vertical', preset: 'neonPulse', renderVariant: 'hardBeat' },
          timeline: { format: 'vertical', preset: 'neonPulse', estimatedDuration: 12, clips: [] },
          media: { imageCount: 3, selectedImageCount: 2, selectedOrder: [], pinnedAssetsByClip: {}, selectedImages: [], audioName: 'beat.mp3' }
        };
      }
    `);
  });

  test('persists, loads, removes and limits library entries', () => {
    runModuleScript(`
      import {
        MAX_PROJECT_LIBRARY_ENTRIES,
        PROJECT_LIBRARY_STORAGE_KEY,
        loadProjectLibrary,
        persistProjectLibrary,
        removeProjectLibraryEntry,
        upsertProjectLibraryEntry
      } from './src/utils/projectLibrary.js';

      const storage = createStorage();
      let entries = [];
      for (let index = 0; index < MAX_PROJECT_LIBRARY_ENTRIES + 2; index += 1) {
        entries = upsertProjectLibraryEntry(entries, createPayload(index), {
          id: \`project-\${index}\`,
          savedAt: \`2026-08-04T00:00:\${String(index).padStart(2, '0')}.000Z\`
        });
      }

      persistProjectLibrary(entries, storage);
      const loaded = loadProjectLibrary(storage);
      const removed = removeProjectLibraryEntry(loaded, 'project-11');

      if (loaded.length !== MAX_PROJECT_LIBRARY_ENTRIES) {
        throw new Error(\`Expected capped library, got \${loaded.length}\`);
      }
      if (storage.getItem(PROJECT_LIBRARY_STORAGE_KEY) === null) {
        throw new Error('Library was not persisted.');
      }
      if (removed.some((entry) => entry.id === 'project-11')) {
        throw new Error('Entry was not removed.');
      }

      storage.setItem(PROJECT_LIBRARY_STORAGE_KEY, '{broken json');
      if (loadProjectLibrary(storage).length !== 0) {
        throw new Error('Broken storage should load as an empty library.');
      }

      function createPayload(index) {
        return {
          schema: 'fotobeat.project.v1',
          exportedAt: '2026-08-04T00:00:00.000Z',
          project: { name: \`Project \${index}\`, format: 'wide', preset: 'dreamFade' },
          timeline: { format: 'wide', preset: 'dreamFade', estimatedDuration: index, clips: [] },
          media: { imageCount: index, selectedImageCount: index, selectedOrder: [], pinnedAssetsByClip: {}, selectedImages: [], audioName: null }
        };
      }

      function createStorage() {
        const store = new Map();
        return {
          getItem: (key) => store.has(key) ? store.get(key) : null,
          setItem: (key, value) => store.set(key, value)
        };
      }
    `);
  });
});
