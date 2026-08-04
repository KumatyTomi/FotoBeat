const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { getFfmpegStatus } = require('../desktop/src/ffmpegDoctor.cjs');
const { buildRenderPlan } = require('../desktop/src/renderPlan.cjs');
const {
  runNativeFfmpegRender,
  validateRenderPlan
} = require('../desktop/src/nativeFfmpegRenderer.cjs');

jest.setTimeout(30000);

const PNG_FRAME = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

describe('native FFmpeg fixture smoke', () => {
  let workspace;

  beforeEach(async () => {
    workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'fotobeat-native-smoke-'));
  });

  afterEach(async () => {
    await fs.rm(workspace, { recursive: true, force: true });
  });

  test('renders a generated PNG sequence and WAV audio when FFmpeg is available', async () => {
    const ffmpeg = await getFfmpegStatus();
    if (!ffmpeg.available || !ffmpeg.binary) {
      console.warn(`Skipping native FFmpeg smoke: ${ffmpeg.installHint}`);
      return;
    }

    const audio = createSineWaveWav({ durationSeconds: 0.5 });
    await writeFixtureInputs(workspace, { frameCount: 6, audio });

    const job = createNativeSmokeJob(workspace, { audioSize: audio.byteLength });
    const plan = buildRenderPlan(job);
    const validation = await validateRenderPlan(plan);
    expect(validation).toEqual({ ok: true, errors: [], warnings: [] });

    const planPath = path.join(workspace, 'render-plan.json');
    await fs.writeFile(planPath, JSON.stringify(plan, null, 2), 'utf8');

    const progressEvents = [];
    const result = await runNativeRenderWithLogs({
      renderPlanPath: planPath,
      ffmpegBinary: ffmpeg.binary,
      onProgress: (event) => progressEvents.push(event.progress)
    });

    expect(result.ffmpeg.exitCode).toBe(0);
    expect(result.output.exists).toBe(true);
    expect(result.output.sizeBytes).toBeGreaterThan(512);
    expect(progressEvents.at(-1)).toBe(100);
  });
});

async function runNativeRenderWithLogs(options) {
  try {
    return await runNativeFfmpegRender(options);
  } catch (error) {
    const logs = Array.isArray(error.logs) ? error.logs.join('\n').slice(-4000) : '';
    error.message = logs ? `${error.message}\n\nFFmpeg logs:\n${logs}` : error.message;
    throw error;
  }
}

async function writeFixtureInputs(jobFolder, { frameCount, audio }) {
  const framesFolder = path.join(jobFolder, 'frames');
  const audioFolder = path.join(jobFolder, 'audio');
  await fs.mkdir(framesFolder, { recursive: true });
  await fs.mkdir(audioFolder, { recursive: true });

  for (let index = 0; index < frameCount; index += 1) {
    const fileName = `frame_${String(index + 1).padStart(4, '0')}.png`;
    await fs.writeFile(path.join(framesFolder, fileName), PNG_FRAME);
  }

  await fs.writeFile(path.join(audioFolder, 'input-audio'), audio);
}

function createNativeSmokeJob(jobFolder, { audioSize }) {
  const outputPath = path.join(jobFolder, 'fotobeat-native-smoke.mp4');

  return {
    id: 'native-ffmpeg-smoke',
    jobFolder,
    outputPath,
    tempOutputPath: `${outputPath}.partial`,
    manifest: {
      project: { id: 'smoke-project', title: 'Native FFmpeg smoke' },
      preset: { id: 'smoke-preset', name: 'Smoke preset' },
      renderProfile: {
        id: 'native-smoke-mp4',
        label: 'Native smoke MP4',
        quality: 'test',
        target: 'native-ffmpeg',
        width: 64,
        height: 64,
        fps: 12,
        crf: 30,
        preset: 'ultrafast',
        audioBitrate: '96k'
      },
      format: { id: 'square', label: 'Square', width: 64, height: 64, ratio: '1:1' },
      sequence: {
        id: 'smoke-sequence',
        fps: 12,
        width: 64,
        height: 64,
        seconds: 0.5,
        frameCount: 6,
        totalSize: PNG_FRAME.byteLength * 6
      },
      audio: { name: 'smoke.wav', size: audioSize, type: 'audio/wav' },
      media: { selectedImages: [{ id: 'frame-1' }] },
      timeline: { estimatedDuration: 0.5 }
    },
    audioImport: {
      sourceFileName: 'smoke.wav',
      size: audioSize,
      type: 'audio/wav',
      manifestPath: path.join(jobFolder, 'audio', 'audio-manifest.json')
    }
  };
}

function createSineWaveWav({ durationSeconds, sampleRate = 44100, frequency = 440 }) {
  const sampleCount = Math.max(1, Math.floor(durationSeconds * sampleRate));
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const value = Math.sin((2 * Math.PI * frequency * index) / sampleRate);
    buffer.writeInt16LE(Math.round(value * 0.25 * 32767), 44 + index * 2);
  }

  return buffer;
}
