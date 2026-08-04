const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('MP4 export plan', () => {
  test('resolves Auto to production MP4 profiles for vertical and wide sequences', () => {
    runModuleScript(`
      import { buildMp4ExportPlan } from './src/utils/mp4ExportPlan.js';

      function createSequence({ width, height, id }) {
        return {
          id,
          projectName: 'Production MP4',
          width,
          height,
          fps: 30,
          seconds: 1,
          frameCount: 1,
          frames: [{ fileName: 'frame_0001.png', blob: new Blob(['png']), size: 3 }]
        };
      }

      const verticalPlan = buildMp4ExportPlan({
        sequence: createSequence({ id: 'vertical', width: 1080, height: 1920 }),
        profileId: 'auto'
      });
      const widePlan = buildMp4ExportPlan({
        sequence: createSequence({ id: 'wide', width: 1920, height: 1080 }),
        profileId: 'auto'
      });

      if (verticalPlan.profileId !== 'mp4-mobile-vertical') {
        throw new Error(\`Expected vertical production profile, got \${verticalPlan.profileId}\`);
      }
      if (widePlan.profileId !== 'mp4-wide-hd') {
        throw new Error(\`Expected wide production profile, got \${widePlan.profileId}\`);
      }
      if (verticalPlan.status !== 'ready-for-ffmpeg-wasm' || widePlan.status !== 'ready-for-ffmpeg-wasm') {
        throw new Error(\`Expected ready plans: \${verticalPlan.status}, \${widePlan.status}\`);
      }
      if (!verticalPlan.shellCommand.includes('scale=1080:1920')) {
        throw new Error(\`Expected vertical scale filter: \${verticalPlan.shellCommand}\`);
      }
      if (!widePlan.shellCommand.includes('scale=1920:1080')) {
        throw new Error(\`Expected wide scale filter: \${widePlan.shellCommand}\`);
      }
    `);
  });
});
