const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { buildRenderPlan } = require('../desktop/src/renderPlan.cjs');
const { loadRenderPlan, validateRenderPlan } = require('../desktop/src/nativeFfmpegRenderer.cjs');

const WIDE_PROFILE = {
  id: 'mp4-wide-hd',
  label: 'MP4 Production 16:9',
  quality: 'production',
  target: 'ffmpeg-wasm',
  width: 1920,
  height: 1080,
  fps: 30,
  crf: 18,
  preset: 'slow',
  audioBitrate: '256k'
};

describe('desktop native render plans', () => {
  let workspace;

  beforeEach(async () => {
    workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'fotobeat-render-plan-'));
  });

  afterEach(async () => {
    await fs.rm(workspace, { recursive: true, force: true });
  });

  test('builds frame-sequence FFmpeg args with audio, profile settings, and temp output', () => {
    const job = createJob(workspace, { withAudio: true, renderProfile: WIDE_PROFILE });
    const plan = buildRenderPlan(job);

    expect(plan).toMatchObject({
      schemaVersion: 'fotobeat.desktop.render-plan.v1',
      inputMode: 'frame-sequence',
      renderProfile: WIDE_PROFILE,
      format: {
        width: 1920,
        height: 1080
      },
      output: {
        path: job.outputPath,
        tempPath: job.tempOutputPath,
        audioCodec: 'aac',
        crf: 18,
        preset: 'slow',
        audioBitrate: '256k',
        renderProfileId: 'mp4-wide-hd'
      },
      inputs: {
        audio: {
          required: true,
          imported: true,
          path: 'audio/input-audio'
        },
        sequence: {
          expectedPattern: 'frames/frame_%04d.png'
        }
      }
    });

    expect(plan.ffmpeg.args).toEqual(expect.arrayContaining([
      '-framerate',
      '30',
      '-i',
      'frames/frame_%04d.png',
      '-i',
      'audio/input-audio',
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '18',
      '-c:a',
      'aac',
      '-b:a',
      '256k',
      '-shortest',
      '-movflags',
      '+faststart',
      job.tempOutputPath
    ]));
  });

  test('validates a render plan with imported frames and audio', async () => {
    await writeNativeInputs(workspace, { withAudio: true });
    const plan = buildRenderPlan(createJob(workspace, { withAudio: true }));
    const planPath = path.join(workspace, 'render-plan.json');
    await fs.writeFile(planPath, JSON.stringify(plan, null, 2), 'utf8');

    const loadedPlan = await loadRenderPlan(planPath);
    const validation = await validateRenderPlan(loadedPlan);

    expect(validation).toEqual({ ok: true, errors: [], warnings: [] });
  });

  test('blocks native render validation when the first frame is missing', async () => {
    const plan = buildRenderPlan(createJob(workspace));
    const validation = await validateRenderPlan(plan);

    expect(validation.ok).toBe(false);
    expect(validation.errors).toEqual(expect.arrayContaining([
      expect.stringContaining('First frame not found')
    ]));
  });
});

function createJob(jobFolder, { withAudio = false, renderProfile = null } = {}) {
  const outputPath = path.join(jobFolder, 'fotobeat-output.mp4');
  return {
    id: 'local-render-test',
    jobFolder,
    outputPath,
    tempOutputPath: `${outputPath}.partial`,
    manifest: {
      project: { id: 'project-1', title: 'Desktop render test' },
      preset: { id: 'neon-pulse', name: 'Neon Pulse' },
      renderProfile,
      format: { id: 'vertical', label: 'Vertical', width: 1080, height: 1920, ratio: '9:16' },
      sequence: {
        id: 'seq-1',
        fps: 30,
        width: 1080,
        height: 1920,
        seconds: 2,
        frameCount: 60,
        totalSize: 2048
      },
      audio: withAudio ? { name: 'beat.mp3', size: 512, type: 'audio/mpeg' } : null,
      media: { selectedImages: [{ id: 'image-1' }] },
      timeline: { estimatedDuration: 2 }
    },
    audioImport: withAudio ? {
      sourceFileName: 'beat.mp3',
      size: 512,
      type: 'audio/mpeg',
      manifestPath: path.join(jobFolder, 'audio', 'audio-manifest.json')
    } : null
  };
}

async function writeNativeInputs(jobFolder, { withAudio = false } = {}) {
  await fs.mkdir(path.join(jobFolder, 'frames'), { recursive: true });
  await fs.writeFile(path.join(jobFolder, 'frames', 'frame_0001.png'), Buffer.from('png-frame'));

  if (withAudio) {
    await fs.mkdir(path.join(jobFolder, 'audio'), { recursive: true });
    await fs.writeFile(path.join(jobFolder, 'audio', 'input-audio'), Buffer.from('audio-input'));
  }
}
