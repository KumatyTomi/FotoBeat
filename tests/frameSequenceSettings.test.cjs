const { execFileSync } = require('node:child_process');

function runSettingsScript(script) {
  execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
}

test('resolves frame sequence presets and default summary', () => {
  expect(() => runSettingsScript(`
    import {
      describeFrameSequenceSettings,
      getFrameSequencePreset
    } from './src/utils/frameSequenceSettings.js';

    const fallback = getFrameSequencePreset('missing');
    if (fallback.id !== 'preview') {
      throw new Error(\`Expected preview fallback, got \${fallback.id}\`);
    }

    const summary = describeFrameSequenceSettings(fallback);
    if (summary !== '5s @ 12 fps · 60 klatek') {
      throw new Error(\`Unexpected summary: \${summary}\`);
    }
  `)).not.toThrow();
});

test('normalizes invalid and oversized frame sequence settings', () => {
  expect(() => runSettingsScript(`
    import { normalizeFrameSequenceSettings } from './src/utils/frameSequenceSettings.js';

    const invalid = normalizeFrameSequenceSettings({ seconds: null, fps: 99 });
    if (invalid.seconds !== 5 || invalid.fps !== 30 || invalid.frameCount !== 150 || !invalid.clamped) {
      throw new Error(\`Invalid input was not normalized correctly: \${JSON.stringify(invalid)}\`);
    }

    const oversized = normalizeFrameSequenceSettings({ seconds: 180, fps: 30 });
    if (oversized.seconds !== 90 || oversized.fps !== 30 || oversized.frameCount !== 2700 || !oversized.clamped) {
      throw new Error(\`Oversized input was not clamped correctly: \${JSON.stringify(oversized)}\`);
    }
  `)).not.toThrow();
});
