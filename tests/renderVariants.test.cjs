const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('render variants', () => {
  test('exposes clean, hardBeat and cinematic variants with hardBeat fallback', () => {
    runModuleScript(`
      import { DEFAULT_RENDER_VARIANT_ID, RENDER_VARIANTS, describeRenderVariant, getRenderVariant } from './src/utils/renderVariants.js';

      const ids = RENDER_VARIANTS.map((variant) => variant.id).join(',');
      if (ids !== 'clean,hardBeat,cinematic') {
        throw new Error(\`Unexpected variant order: \${ids}\`);
      }
      if (DEFAULT_RENDER_VARIANT_ID !== 'hardBeat') {
        throw new Error(\`Unexpected default variant: \${DEFAULT_RENDER_VARIANT_ID}\`);
      }
      if (getRenderVariant('missing').id !== 'hardBeat') {
        throw new Error('Missing variant should fall back to hardBeat.');
      }
      if (!describeRenderVariant('cinematic').includes('Cinematic')) {
        throw new Error('Cinematic description should include label.');
      }
    `);
  });
});
