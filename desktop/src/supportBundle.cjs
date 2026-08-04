const fs = require('node:fs/promises');
const path = require('node:path');

async function createRenderSupportBundle({ jobId, jobFolder, ffmpegStatus = null } = {}) {
  if (!jobFolder || !path.isAbsolute(jobFolder)) {
    throw new Error('Absolute jobFolder is required to create a render support bundle.');
  }

  const statusPath = path.join(jobFolder, 'render-job.json');
  const jobStatus = await readJsonFile(statusPath);
  const resolvedJobId = jobId ?? jobStatus.id;

  if (!resolvedJobId) {
    throw new Error('Support bundle requires a render job id.');
  }

  if (jobId && jobStatus.id && jobStatus.id !== jobId) {
    throw new Error(`Support bundle job id mismatch: expected ${jobId}, got ${jobStatus.id}.`);
  }

  const paths = resolveSupportPaths(jobFolder, jobStatus);
  const [manifest, renderPlan, outputSidecar, frameImportManifest, audioImportManifest, files] = await Promise.all([
    readOptionalJson(paths.manifestPath),
    readOptionalJson(paths.renderPlanPath),
    readOptionalJson(paths.sidecarPath),
    readOptionalJson(paths.frameManifestPath),
    readOptionalJson(paths.audioManifestPath),
    inspectSupportFiles(paths)
  ]);

  const createdAt = new Date().toISOString();
  const payload = {
    schemaVersion: 'fotobeat.desktop.support-bundle.v1',
    createdAt,
    jobId: resolvedJobId,
    jobFolder,
    ffmpegStatus,
    files,
    manifest,
    renderPlan,
    jobStatus,
    outputSidecar,
    frameImportManifest,
    audioImportManifest,
    logs: Array.isArray(jobStatus.logs) ? jobStatus.logs : []
  };

  const fileName = `fotobeat-support-${safeFilePart(resolvedJobId)}-${toTimestampSlug(createdAt)}.json`;
  const bundlePath = path.join(jobFolder, fileName);
  await fs.writeFile(bundlePath, JSON.stringify(payload, null, 2), 'utf8');
  const stats = await fs.stat(bundlePath);

  return {
    schemaVersion: 'fotobeat.desktop.support-bundle-result.v1',
    path: bundlePath,
    fileName,
    sizeBytes: stats.size,
    createdAt,
    included: Object.fromEntries(Object.entries(files).map(([key, value]) => [key, Boolean(value.exists)]))
  };
}

function resolveSupportPaths(jobFolder, jobStatus = {}) {
  const outputPath = jobStatus.outputPath ?? null;

  return {
    statusPath: jobStatus.statusPath ?? path.join(jobFolder, 'render-job.json'),
    manifestPath: jobStatus.manifestPath ?? path.join(jobFolder, 'manifest.fotobeat.json'),
    renderPlanPath: jobStatus.renderPlanPath ?? path.join(jobFolder, 'render-plan.json'),
    sidecarPath: jobStatus.sidecarPath ?? (outputPath ? `${outputPath}.json` : null),
    frameManifestPath: jobStatus.frameImport?.manifestPath ?? path.join(jobFolder, 'frames', 'frames-manifest.json'),
    audioManifestPath: jobStatus.audioImport?.manifestPath ?? path.join(jobFolder, 'audio', 'audio-manifest.json'),
    outputPath,
    tempOutputPath: jobStatus.tempOutputPath ?? null
  };
}

async function inspectSupportFiles(paths) {
  const entries = await Promise.all(Object.entries(paths).map(async ([key, targetPath]) => [
    key,
    await inspectFile(targetPath)
  ]));

  return Object.fromEntries(entries);
}

async function inspectFile(targetPath) {
  if (!targetPath) {
    return { exists: false, path: null };
  }

  try {
    const stats = await fs.stat(targetPath);
    return {
      exists: true,
      path: targetPath,
      sizeBytes: stats.size,
      modifiedAt: stats.mtime.toISOString(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    return {
      exists: false,
      path: targetPath,
      error: error.code ?? error.message
    };
  }
}

async function readJsonFile(targetPath) {
  const raw = await fs.readFile(targetPath, 'utf8');
  return JSON.parse(raw);
}

async function readOptionalJson(targetPath) {
  if (!targetPath) return null;

  try {
    return await readJsonFile(targetPath);
  } catch {
    return null;
  }
}

function safeFilePart(value) {
  return String(value).replace(/[^a-z0-9_.-]+/gi, '-').replace(/^-+|-+$/g, '') || 'render-job';
}

function toTimestampSlug(value) {
  return value.replace(/[:.]/g, '-');
}

module.exports = {
  createRenderSupportBundle,
  inspectSupportFiles,
  resolveSupportPaths
};
