const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('export hub route selection', () => {
  test('prefers native MP4 when sequence, desktop and FFmpeg are ready', () => {
    runModuleScript(`
      import { buildExportHubPlan } from './src/utils/exportHub.js';

      const plan = buildExportHubPlan({
        sequences: [{ id: 'seq-1', createdAt: '2026-08-04T01:00:00.000Z' }],
        desktopAvailable: true,
        ffmpegReady: true,
        audioAvailable: true
      });

      if (plan.recommended.id !== 'native-mp4') {
        throw new Error(\`Expected native-mp4, got \${plan.recommended?.id}\`);
      }

      if (plan.actions.find((action) => action.id === 'mp4-poc').label !== 'MP4 POC + audio') {
        throw new Error('Expected audio-aware MP4 POC label.');
      }
    `);
  });

  test('falls back through MP4, WebM and ZIP according to readiness', () => {
    runModuleScript(`
      import { buildExportHubPlan, describeExportHubAction } from './src/utils/exportHub.js';

      const sequence = { id: 'seq-1', createdAt: '2026-08-04T01:00:00.000Z' };
      const mp4Fallback = buildExportHubPlan({
        sequences: [sequence],
        desktopAvailable: true,
        ffmpegReady: false
      });
      if (mp4Fallback.recommended.id !== 'mp4-poc') {
        throw new Error(\`Expected mp4-poc, got \${mp4Fallback.recommended?.id}\`);
      }

      const webmFallback = buildExportHubPlan({
        sequences: [sequence],
        desktopAvailable: false,
        ffmpegReady: false,
        mp4Busy: true
      });
      if (webmFallback.recommended.id !== 'webm') {
        throw new Error(\`Expected webm, got \${webmFallback.recommended?.id}\`);
      }

      const zipFallback = buildExportHubPlan({
        sequences: [sequence],
        mp4Busy: true,
        webmBusy: true
      });
      if (zipFallback.recommended.id !== 'zip-frames') {
        throw new Error(\`Expected zip-frames, got \${zipFallback.recommended?.id}\`);
      }

      const blockedNative = zipFallback.actions.find((action) => action.id === 'native-mp4');
      if (!describeExportHubAction(blockedNative).includes('Electron')) {
        throw new Error('Expected native blocker explanation.');
      }
    `);
  });
});
