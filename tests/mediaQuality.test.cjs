const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('media quality report', () => {
  test('reports readiness, duplicate groups and global warnings', () => {
    runModuleScript(`
      import { buildMediaQualityReport } from './src/utils/mediaQuality.js';

      const report = buildMediaQualityReport([
        { id: 'portrait', name: 'portrait.jpg', status: 'ready', width: 1080, height: 1920, orientation: 'portrait', size: 500000, type: 'image/jpeg' },
        { id: 'landscape', name: 'landscape.jpg', status: 'ready', width: 1920, height: 1080, orientation: 'landscape', size: 300000, type: 'image/jpeg' },
        { id: 'dup-1', name: 'small.jpg', status: 'ready', width: 320, height: 320, orientation: 'square', size: 50000, type: 'image/jpeg' },
        { id: 'dup-2', name: 'small.jpg', status: 'ready', width: 320, height: 320, orientation: 'square', size: 50000, type: 'image/jpeg' }
      ], { id: 'vertical', width: 1080, height: 1920 });

      if (report.total !== 4 || report.ready !== 4 || report.readyRatio !== 1) {
        throw new Error(\`Unexpected readiness: \${JSON.stringify(report)}\`);
      }
      if (report.duplicateGroups.length !== 1 || report.duplicateGroups[0].count !== 2) {
        throw new Error(\`Expected one duplicate group, got \${JSON.stringify(report.duplicateGroups)}\`);
      }
      if (!report.warnings.some((warning) => warning.includes('duplikat'))) {
        throw new Error(\`Expected duplicate warning: \${JSON.stringify(report.warnings)}\`);
      }
      if (!report.warnings.some((warning) => warning.includes('9:16'))) {
        throw new Error(\`Expected vertical crop warning: \${JSON.stringify(report.warnings)}\`);
      }
    `);
  });

  test('handles null input as an empty report', () => {
    runModuleScript(`
      import { analyzeMediaQuality, buildMediaQualityReport, detectDuplicateGroups } from './src/utils/mediaQuality.js';

      const report = buildMediaQualityReport(null, null);
      const item = analyzeMediaQuality(null, null);
      const duplicateGroups = detectDuplicateGroups(null);

      if (report.total !== 0 || report.ready !== 0 || report.readyRatio !== 0 || report.warnings.length !== 0) {
        throw new Error(\`Unexpected null report: \${JSON.stringify(report)}\`);
      }
      if (item.id !== 'unknown-media' || item.score !== 0 || item.warnings.length === 0) {
        throw new Error(\`Unexpected null item: \${JSON.stringify(item)}\`);
      }
      if (duplicateGroups.length !== 0) {
        throw new Error(\`Unexpected duplicate groups: \${JSON.stringify(duplicateGroups)}\`);
      }
    `);
  });
});
