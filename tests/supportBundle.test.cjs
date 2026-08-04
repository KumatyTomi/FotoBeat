const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createRenderSupportBundle } = require('../desktop/src/supportBundle.cjs');

describe('desktop render support bundle', () => {
  let workspace;

  beforeEach(async () => {
    workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'fotobeat-support-bundle-'));
  });

  afterEach(async () => {
    await fs.rm(workspace, { recursive: true, force: true });
  });

  test('writes a diagnostics JSON bundle without binary media payloads', async () => {
    const jobId = 'local-render-support-test';
    const outputPath = path.join(workspace, 'fotobeat-output.mp4');
    const statusPath = path.join(workspace, 'render-job.json');
    const manifestPath = path.join(workspace, 'manifest.fotobeat.json');
    const renderPlanPath = path.join(workspace, 'render-plan.json');
    const sidecarPath = `${outputPath}.json`;
    const frameManifestPath = path.join(workspace, 'frames', 'frames-manifest.json');
    const audioManifestPath = path.join(workspace, 'audio', 'audio-manifest.json');

    await fs.mkdir(path.dirname(frameManifestPath), { recursive: true });
    await fs.mkdir(path.dirname(audioManifestPath), { recursive: true });
    await fs.writeFile(outputPath, 'mp4-bytes');
    await fs.writeFile(statusPath, JSON.stringify({
      id: jobId,
      status: 'failed',
      progress: 42,
      outputPath,
      tempOutputPath: `${outputPath}.partial`,
      sidecarPath,
      manifestPath,
      renderPlanPath,
      frameImport: { manifestPath: frameManifestPath, count: 1 },
      audioImport: { manifestPath: audioManifestPath, size: 12 },
      logs: ['one', 'two']
    }, null, 2), 'utf8');
    await fs.writeFile(manifestPath, JSON.stringify({ manifest: { project: { title: 'Support test' } } }, null, 2));
    await fs.writeFile(renderPlanPath, JSON.stringify({ schemaVersion: 'fotobeat.desktop.render-plan.v1' }, null, 2));
    await fs.writeFile(sidecarPath, JSON.stringify({ schemaVersion: 'fotobeat.desktop.output-sidecar.v1' }, null, 2));
    await fs.writeFile(frameManifestPath, JSON.stringify({ count: 1 }, null, 2));
    await fs.writeFile(audioManifestPath, JSON.stringify({ size: 12 }, null, 2));

    const result = await createRenderSupportBundle({
      jobId,
      jobFolder: workspace,
      ffmpegStatus: { available: true, binary: 'ffmpeg', version: 'test' }
    });

    expect(result.path).toContain('fotobeat-support-local-render-support-test');
    expect(result.sizeBytes).toBeGreaterThan(500);
    expect(result.included).toMatchObject({
      statusPath: true,
      manifestPath: true,
      renderPlanPath: true,
      sidecarPath: true,
      frameManifestPath: true,
      audioManifestPath: true,
      outputPath: true
    });

    const bundle = JSON.parse(await fs.readFile(result.path, 'utf8'));
    expect(bundle).toMatchObject({
      schemaVersion: 'fotobeat.desktop.support-bundle.v1',
      jobId,
      ffmpegStatus: { available: true, binary: 'ffmpeg', version: 'test' },
      jobStatus: { status: 'failed', progress: 42 },
      logs: ['one', 'two']
    });
    expect(bundle.files.outputPath.sizeBytes).toBe(9);
    expect(bundle).not.toHaveProperty('outputBytes');
  });
});
