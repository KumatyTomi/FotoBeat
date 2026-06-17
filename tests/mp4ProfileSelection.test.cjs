const { execFileSync } = require('node:child_process');

function runProfileResolutionScript(script) {
  execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
}

test('resolves Auto MP4 profile from sequence proportions', () => {
  expect(() => runProfileResolutionScript(`
    import { getResolvedMp4Profile } from './src/utils/mp4ProfileSelection.js';

    const cases = [
      [getResolvedMp4Profile({ profileId: 'auto', sequence: { width: 1080, height: 1920 } }), 'mp4-mobile-vertical'],
      [getResolvedMp4Profile({ profileId: 'auto', sequence: { width: 1920, height: 1080 } }), 'mp4-wide-hd'],
      [getResolvedMp4Profile({ profileId: 'auto', sequence: { width: 1080, height: 1080 } }), 'mp4-square-social']
    ];

    for (const [profile, expectedId] of cases) {
      if (profile.id !== expectedId) {
        throw new Error(\`Expected \${expectedId}, got \${profile.id}\`);
      }
    }
  `)).not.toThrow();
});

test('resolves audio POC when the stored POC profile is used with audio', () => {
  expect(() => runProfileResolutionScript(`
    import { getResolvedMp4Profile } from './src/utils/mp4ProfileSelection.js';

    const profile = getResolvedMp4Profile({
      profileId: 'mp4-poc',
      sequence: { width: 1080, height: 1920 },
      includeAudio: true
    });

    if (profile.id !== 'mp4-audio-poc') {
      throw new Error(\`Expected mp4-audio-poc, got \${profile.id}\`);
    }

    if (profile.audioBitrate !== '160k') {
      throw new Error(\`Expected 160k audio bitrate, got \${profile.audioBitrate}\`);
    }
  `)).not.toThrow();
});
