const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

function runModuleScript(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

describe('desktop audio payload utilities', () => {
  test('passes through a valid audio file-like object', () => {
    runModuleScript(`
      import {
        createDesktopAudioFilePayload,
        getSelectedDesktopAudioFile,
        validateDesktopAudioPayload
      } from './src/utils/desktopAudioPayload.js';

      const bytes = new Uint8Array([1, 2, 3, 4]).buffer;
      const file = {
        name: 'beat.mp3',
        size: 4,
        type: 'audio/mpeg',
        async arrayBuffer() {
          return bytes;
        }
      };

      if (getSelectedDesktopAudioFile({ window: { __fotobeatDesktopAudioFile: file } }) !== file) {
        throw new Error('Expected window-selected audio file.');
      }

      const validation = validateDesktopAudioPayload(file);
      if (!validation.ok || validation.size !== 4) {
        throw new Error('Expected valid audio payload.');
      }

      const payload = await createDesktopAudioFilePayload(file);
      if (payload.fileName !== 'beat.mp3' || payload.size !== 4 || payload.arrayBuffer.byteLength !== 4) {
        throw new Error('Unexpected desktop audio payload.');
      }
    `);
  });

  test('blocks empty, invalid and oversized audio before reading bytes', () => {
    runModuleScript(`
      import {
        DESKTOP_AUDIO_LIMITS,
        createDesktopAudioFilePayload,
        getSelectedDesktopAudioFile,
        validateDesktopAudioPayload
      } from './src/utils/desktopAudioPayload.js';

      if (getSelectedDesktopAudioFile({ window: { __fotobeatDesktopAudioFile: { size: 8 } } }) !== null) {
        throw new Error('Expected invalid global audio candidate to be ignored.');
      }

      if (!validateDesktopAudioPayload(null).ok) {
        throw new Error('Missing audio should be allowed.');
      }

      if (validateDesktopAudioPayload({ name: 'empty.mp3', size: 0, arrayBuffer: async () => new ArrayBuffer(0) }).ok) {
        throw new Error('Expected empty audio to be blocked.');
      }

      let readCount = 0;
      const oversized = {
        name: 'huge.wav',
        size: DESKTOP_AUDIO_LIMITS.maxBytes + 1,
        type: 'audio/wav',
        async arrayBuffer() {
          readCount += 1;
          return new ArrayBuffer(1);
        }
      };

      const validation = validateDesktopAudioPayload(oversized);
      if (validation.ok || !validation.message.includes('Limit desktop IPC')) {
        throw new Error('Expected oversized audio validation error.');
      }

      try {
        await createDesktopAudioFilePayload(oversized);
        throw new Error('Expected oversized payload creation to throw.');
      } catch (error) {
        if (!error.message.includes('Limit desktop IPC')) {
          throw error;
        }
      }

      if (readCount !== 0) {
        throw new Error('Oversized audio should not be read into memory.');
      }
    `);
  });
});
