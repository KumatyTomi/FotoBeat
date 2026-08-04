const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('cover frame selection', () => {
  test('prefers the drop section for smart cover timing', () => {
    runModuleScript(`
      import { pickCoverFrameTime } from './src/utils/coverFrame.js';

      const time = pickCoverFrameTime({
        timeline: {
          estimatedDuration: 10,
          clips: [
            { start: 0, duration: 2, section: 'intro', energy: 1 },
            { start: 2, duration: 2, section: 'build', energy: 0.9 },
            { start: 4, duration: 2, section: 'drop', energy: 0.35 }
          ]
        },
        currentTime: 1
      });

      if (time !== 4.84) {
        throw new Error(\`Expected smart cover at 4.84s, got \${time}\`);
      }
    `);
  });

  test('normalizes current strategy and cover file names', () => {
    runModuleScript(`
      import { buildCoverFrameFileName, describeCoverFrame, pickCoverFrameTime } from './src/utils/coverFrame.js';

      const time = pickCoverFrameTime({
        timeline: { estimatedDuration: 5, clips: [] },
        currentTime: 9,
        strategyId: 'current'
      });
      if (time !== 5) {
        throw new Error(\`Expected clamped current time, got \${time}\`);
      }

      const fallbackTime = pickCoverFrameTime({ timeline: null, currentTime: -10 });
      if (fallbackTime !== 0) {
        throw new Error(\`Expected empty timeline fallback, got \${fallbackTime}\`);
      }

      const fileName = buildCoverFrameFileName({
        projectName: 'My Launch Clip',
        formatId: 'vertical',
        time: 4.84
      });
      if (fileName !== 'my-launch-clip-cover-vertical-4-84.png') {
        throw new Error(\`Unexpected cover file name: \${fileName}\`);
      }

      const description = describeCoverFrame({
        frameMeta: { clipIndex: 3, totalClips: 8, time: 4.84 },
        strategyId: 'smart'
      });
      if (!description.includes('smart drop') || !description.includes('4.84s')) {
        throw new Error(\`Unexpected cover description: \${description}\`);
      }
    `);
  });
});
