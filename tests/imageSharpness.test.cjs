const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('image sharpness scoring', () => {
  test('scores flat images lower than high-contrast edges', () => {
    runModuleScript(`
      import { classifySharpness, describeSharpness, scoreSharpnessFromLuma } from './src/utils/imageSharpness.js';

      const flat = Array.from({ length: 25 }, () => 128);
      const checker = [
        0, 255, 0, 255, 0,
        255, 0, 255, 0, 255,
        0, 255, 0, 255, 0,
        255, 0, 255, 0, 255,
        0, 255, 0, 255, 0
      ];
      const flatScore = scoreSharpnessFromLuma(flat, 5, 5);
      const checkerScore = scoreSharpnessFromLuma(checker, 5, 5);

      if (flatScore !== 0) throw new Error(\`Expected flat score 0, got \${flatScore}\`);
      if (checkerScore <= flatScore) throw new Error(\`Expected checker score above flat score, got \${checkerScore}\`);
      if (classifySharpness(checkerScore) !== 'sharp') throw new Error(\`Expected sharp checker, got \${classifySharpness(checkerScore)}\`);
      if (!describeSharpness(flatScore).includes('rozmyte')) throw new Error('Flat description should be blurry.');
    `);
  });

  test('handles invalid luminance input safely', () => {
    runModuleScript(`
      import { classifySharpness, describeSharpness, scoreSharpnessFromLuma } from './src/utils/imageSharpness.js';

      if (scoreSharpnessFromLuma(null, 5, 5) !== 0) throw new Error('Null luma should score 0.');
      if (scoreSharpnessFromLuma([1, 2], 2, 1) !== 0) throw new Error('Too-small input should score 0.');
      if (classifySharpness(null) !== 'unknown') throw new Error('Null score should be unknown.');
      if (describeSharpness(null) !== 'ostrość nieznana') throw new Error('Null description should be unknown.');
    `);
  });
});
