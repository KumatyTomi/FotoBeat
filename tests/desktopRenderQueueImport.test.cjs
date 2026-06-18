const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {
  appendLocalRenderJobFrames,
  createLocalRenderJob
} = require('../desktop/src/renderQueue.cjs');

describe('desktop render queue chunked frame import', () => {
  let outputFolder;

  beforeEach(async () => {
    outputFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'fotobeat-render-import-'));
  });

  afterEach(async () => {
    await fs.rm(outputFolder, { recursive: true, force: true });
  });

  test('keeps deferred jobs importing and appends frame chunks sequentially', async () => {
    const job = await createLocalRenderJob({
      outputFolder,
      manifest: createManifest(),
      deferStart: true
    });

    expect(job.status).toBe('importing');
    expect(job.mode).toBe('importing');

    const firstChunk = await appendLocalRenderJobFrames(job.id, [
      createFrame(0, 'frame-a'),
      createFrame(1, 'frame-b')
    ]);

    expect(firstChunk.status).toBe('importing');
    expect(firstChunk.frameImport.count).toBe(2);
    expect(firstChunk.frameImport.written.map((frame) => frame.fileName)).toEqual([
      'frame_0001.png',
      'frame_0002.png'
    ]);

    const secondChunk = await appendLocalRenderJobFrames(job.id, [
      createFrame(2, 'frame-c')
    ]);

    expect(secondChunk.status).toBe('importing');
    expect(secondChunk.frameImport.count).toBe(3);
    expect(secondChunk.frameImport.totalSize).toBe(Buffer.byteLength('frame-a') + Buffer.byteLength('frame-b') + Buffer.byteLength('frame-c'));
    expect(secondChunk.frameImport.written.map((frame) => frame.sequenceIndex)).toEqual([0, 1, 2]);
    expect(secondChunk.frameImport.written.map((frame) => frame.fileName)).toEqual([
      'frame_0001.png',
      'frame_0002.png',
      'frame_0003.png'
    ]);

    const frameManifest = JSON.parse(await fs.readFile(secondChunk.frameImport.manifestPath, 'utf8'));
    expect(frameManifest.count).toBe(3);
    expect(frameManifest.lastFrame.fileName).toBe('frame_0003.png');
    await expect(fs.readFile(path.join(secondChunk.frameImport.framesFolder, 'frame_0003.png'), 'utf8')).resolves.toBe('frame-c');
  });
});

function createFrame(index, text) {
  return {
    index,
    fileName: `source-${index}.png`,
    size: Buffer.byteLength(text),
    arrayBuffer: Buffer.from(text)
  };
}

function createManifest() {
  return {
    project: { id: 'project-1', title: 'Chunked render import test' },
    preset: { id: 'neon-pulse', name: 'Neon Pulse' },
    format: { id: 'vertical', label: 'Vertical', width: 1080, height: 1920, ratio: '9:16' },
    sequence: {
      id: 'sequence-1',
      fps: 24,
      width: 1080,
      height: 1920,
      seconds: 1,
      frameCount: 3,
      totalSize: 21
    },
    audio: null,
    media: { selectedImages: [{ id: 'image-1' }] },
    timeline: { estimatedDuration: 1 }
  };
}
