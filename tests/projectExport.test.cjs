const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('project import media diagnostics', () => {
  test('remaps imported media and reports missing selected images and pins', () => {
    runModuleScript(`
      import { remapImportedMedia } from './src/utils/projectExport.js';

      const importedMedia = {
        selectedOrder: ['hero-id', 'detail-id', 'missing-id'],
        selectedImages: [
          { id: 'hero-id', name: 'hero.jpg', size: 100, width: 1200, height: 1800 },
          { id: 'detail-id', name: 'detail.jpg', size: 200, width: 1600, height: 900 },
          { id: 'missing-id', name: 'missing.jpg', size: 300, width: 900, height: 900 }
        ],
        pinnedAssetsByClip: {
          1: 'hero-id',
          2: 'missing-id'
        }
      };
      const currentMediaAssets = [
        { id: 'hero-id', name: 'hero.jpg', size: 100 },
        { id: 'current-detail-id', name: 'detail.jpg', size: 200 }
      ];

      const result = remapImportedMedia(importedMedia, currentMediaAssets);

      if (JSON.stringify(result.selectedOrder) !== JSON.stringify(['hero-id', 'current-detail-id'])) {
        throw new Error(\`Unexpected selected order: \${JSON.stringify(result.selectedOrder)}\`);
      }
      if (JSON.stringify(result.pinnedAssetsByClip) !== JSON.stringify({ 1: 'hero-id' })) {
        throw new Error(\`Unexpected pinned clips: \${JSON.stringify(result.pinnedAssetsByClip)}\`);
      }
      if (result.report.matchedImageCount !== 2 || result.report.missingImageCount !== 1) {
        throw new Error(\`Unexpected report counts: \${JSON.stringify(result.report)}\`);
      }
      if (result.report.missingImages[0].name !== 'missing.jpg') {
        throw new Error('Missing media name was not preserved.');
      }
      if (result.report.missingPinnedClips[0].clipIndex !== '2') {
        throw new Error('Missing pin was not reported.');
      }
    `);
  });

  test('builds a useful report for legacy selectedOrder-only imports', () => {
    runModuleScript(`
      import { buildImportedMediaReport } from './src/utils/projectExport.js';

      const report = buildImportedMediaReport({
        selectedOrder: ['legacy-id', 'legacy-id'],
        selectedImages: []
      }, []);

      if (report.expectedImageCount !== 1 || report.missingImageCount !== 1) {
        throw new Error(\`Expected one deduped missing item, got \${JSON.stringify(report)}\`);
      }
      if (report.missingImages[0].name !== 'legacy-id') {
        throw new Error('Expected selectedOrder id as fallback display name.');
      }
      if (report.ready) {
        throw new Error('Report should not be ready while selected media is missing.');
      }
    `);
  });

  test('treats null media sections as empty import diagnostics', () => {
    runModuleScript(`
      import { buildImportedMediaReport, remapImportedMedia } from './src/utils/projectExport.js';

      const report = buildImportedMediaReport(null, null);
      const remapped = remapImportedMedia(null, null);

      if (!report.ready || report.expectedImageCount !== 0 || report.missingImageCount !== 0) {
        throw new Error(\`Unexpected null report: \${JSON.stringify(report)}\`);
      }
      if (remapped.selectedOrder.length !== 0 || Object.keys(remapped.pinnedAssetsByClip).length !== 0) {
        throw new Error(\`Unexpected null remap: \${JSON.stringify(remapped)}\`);
      }
    `);
  });
});
