const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('edit intensity mapping', () => {
  test('maps calm, dynamic and aggressive values to clip duration scale', () => {
    runModuleScript(`
      import {
        clipDurationScaleFromIntensity,
        getEditIntensityLabel,
        intensityFromClipDurationScale
      } from './src/utils/editIntensity.js';

      if (getEditIntensityLabel(10) !== 'spokojnie') throw new Error('Expected calm label.');
      if (getEditIntensityLabel(55) !== 'dynamicznie') throw new Error('Expected dynamic label.');
      if (getEditIntensityLabel(90) !== 'agresywnie') throw new Error('Expected aggressive label.');
      if (clipDurationScaleFromIntensity(0) !== 1.65) throw new Error('Expected calm scale 1.65.');
      if (clipDurationScaleFromIntensity(100) !== 0.55) throw new Error('Expected aggressive scale 0.55.');
      if (intensityFromClipDurationScale(1) !== 59) {
        throw new Error(\`Unexpected inverse intensity: \${intensityFromClipDurationScale(1)}\`);
      }
    `);
  });

  test('normalizes invalid intensity input and describes the setting', () => {
    runModuleScript(`
      import { describeEditIntensity, normalizeEditIntensity } from './src/utils/editIntensity.js';

      if (normalizeEditIntensity(null) !== 55) throw new Error('Null should use default.');
      if (normalizeEditIntensity('bad') !== 55) throw new Error('Invalid text should use default.');
      if (normalizeEditIntensity(200) !== 100) throw new Error('Intensity should clamp high.');
      if (!describeEditIntensity(80).includes('agresywnie')) {
        throw new Error('Description should include the intensity label.');
      }
    `);
  });
});
