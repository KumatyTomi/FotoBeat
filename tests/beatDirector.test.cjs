const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('beat director', () => {
  test('summarizes timeline sections and director decisions', () => {
    runModuleScript(`
      import { buildBeatDirector, describeBeatDirector } from './src/utils/beatDirector.js';

      const timeline = {
        estimatedDuration: 8,
        clips: [
          { start: 0, duration: 2, section: 'intro', energy: 0.18 },
          { start: 2, duration: 2, section: 'build', energy: 0.48 },
          { start: 4, duration: 2, section: 'drop', energy: 0.92 },
          { start: 6, duration: 2, section: 'outro', energy: 0.32 }
        ]
      };

      const director = buildBeatDirector({
        timeline,
        audioAnalysis: { analysisMode: 'transient', beats: [0.5, 1, 1.5, 2] },
        editIntensity: 85
      });

      if (!director.ready) throw new Error('Expected director to be ready.');
      if (director.clipCount !== 4 || director.sectionCount !== 4) {
        throw new Error(\`Unexpected director counts: \${JSON.stringify(director)}\`);
      }
      if (director.cutDensity !== 5) throw new Error(\`Unexpected cut density: \${director.cutDensity}\`);
      if (director.intensityLabel !== 'agresywnie') {
        throw new Error(\`Unexpected intensity label: \${director.intensityLabel}\`);
      }
      if (director.sections.map((section) => section.id).join(',') !== 'intro,build,drop,outro') {
        throw new Error(\`Unexpected section order: \${JSON.stringify(director.sections)}\`);
      }
      if (director.sections[2].label !== 'Drop' || director.sections[2].averageEnergy !== 0.92) {
        throw new Error(\`Unexpected drop summary: \${JSON.stringify(director.sections[2])}\`);
      }
      if (!director.decisions.some((decision) => decision.includes('transienty audio'))) {
        throw new Error(\`Missing transient decision: \${JSON.stringify(director.decisions)}\`);
      }
      if (!director.decisions.some((decision) => decision.includes('Drop: 1 klipów'))) {
        throw new Error(\`Missing drop decision: \${JSON.stringify(director.decisions)}\`);
      }
      if (!describeBeatDirector(director).includes('4 klipów')) {
        throw new Error('Description should include clip count.');
      }
    `);
  });

  test('handles empty input as a waiting state', () => {
    runModuleScript(`
      import { buildBeatDirector, describeBeatDirector } from './src/utils/beatDirector.js';

      const director = buildBeatDirector(null);

      if (director.ready) throw new Error('Empty director should not be ready.');
      if (director.sectionCount !== 0 || director.clipCount !== 0 || director.cutDensity !== 0) {
        throw new Error(\`Unexpected empty director: \${JSON.stringify(director)}\`);
      }
      if (director.decisions.length !== 3) {
        throw new Error(\`Expected fallback decisions for empty director: \${JSON.stringify(director.decisions)}\`);
      }
      if (describeBeatDirector(director) !== 'Beat Director czeka na timeline.') {
        throw new Error(\`Unexpected waiting description: \${describeBeatDirector(director)}\`);
      }
    `);
  });
});
