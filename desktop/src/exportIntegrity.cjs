const fs = require('node:fs/promises');
const path = require('node:path');

const MIN_RECOMMENDED_FREE_BYTES = 2 * 1024 * 1024 * 1024;

async function prepareRenderWorkspace({ outputFolder, jobId, preferredFileName }) {
  if (!outputFolder) {
    throw new Error('Output folder is required for a desktop render workspace.');
  }

  await ensureDirectory(outputFolder);
  await ensureWritableDirectory(outputFolder);

  const jobFolder = path.join(outputFolder, jobId);
  await ensureDirectory(jobFolder);
  await ensureWritableDirectory(jobFolder);

  const freeSpace = await getFreeSpaceSafe(jobFolder);
  const outputPath = await createCollisionSafePath(jobFolder, preferredFileName);
  const tempOutputPath = `${outputPath}.partial`;
  const sidecarPath = `${outputPath}.json`;

  return {
    jobFolder,
    outputPath,
    tempOutputPath,
    sidecarPath,
    freeSpace,
    warnings: buildWarnings(freeSpace)
  };
}

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function ensureWritableDirectory(directoryPath) {
  const probePath = path.join(directoryPath, `.fotobeat-write-test-${Date.now()}.tmp`);
  await fs.writeFile(probePath, 'ok', 'utf8');
  await fs.unlink(probePath);
}

async function getFreeSpaceSafe(directoryPath) {
  try {
    if (typeof fs.statfs !== 'function') {
      return null;
    }

    const stats = await fs.statfs(directoryPath);
    return {
      availableBytes: Number(stats.bavail) * Number(stats.bsize),
      blockSize: Number(stats.bsize),
      availableBlocks: Number(stats.bavail)
    };
  } catch (error) {
    return {
      availableBytes: null,
      error: error.message
    };
  }
}

async function createCollisionSafePath(directoryPath, preferredFileName) {
  const parsed = path.parse(preferredFileName);
  let candidate = path.join(directoryPath, preferredFileName);
  let index = 1;

  while (await pathExists(candidate)) {
    candidate = path.join(directoryPath, `${parsed.name}-${index}${parsed.ext}`);
    index += 1;
  }

  return candidate;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeOutputSidecar(job) {
  if (!job.sidecarPath) return null;

  const payload = {
    schemaVersion: 'fotobeat.desktop.output-sidecar.v1',
    jobId: job.id,
    status: job.status,
    outputPath: job.outputPath,
    tempOutputPath: job.tempOutputPath,
    renderPlanPath: job.renderPlanPath,
    manifestPath: job.manifestPath,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    progress: job.progress,
    logs: job.logs,
    integrity: job.integrity ?? null
  };

  await fs.writeFile(job.sidecarPath, JSON.stringify(payload, null, 2), 'utf8');
  return job.sidecarPath;
}

async function promoteTempOutput(job) {
  if (!job.tempOutputPath || !job.outputPath) {
    throw new Error('Both tempOutputPath and outputPath are required to promote output.');
  }

  await fs.rename(job.tempOutputPath, job.outputPath);
  return job.outputPath;
}

async function cleanupPartialOutput(job) {
  if (!job.tempOutputPath) return false;

  try {
    await fs.unlink(job.tempOutputPath);
    return true;
  } catch {
    return false;
  }
}

async function inspectOutput(job) {
  if (!job.outputPath) {
    return {
      exists: false,
      sizeBytes: 0,
      error: 'No outputPath set.'
    };
  }

  try {
    const stats = await fs.stat(job.outputPath);
    return {
      exists: true,
      sizeBytes: stats.size,
      modifiedAt: stats.mtime.toISOString(),
      path: job.outputPath
    };
  } catch (error) {
    return {
      exists: false,
      sizeBytes: 0,
      error: error.message,
      path: job.outputPath
    };
  }
}

function buildWarnings(freeSpace) {
  const warnings = [];

  if (!freeSpace) {
    warnings.push('Free space check unavailable in this runtime.');
    return warnings;
  }

  if (freeSpace.error) {
    warnings.push(`Free space check failed: ${freeSpace.error}`);
  }

  if (Number.isFinite(freeSpace.availableBytes) && freeSpace.availableBytes < MIN_RECOMMENDED_FREE_BYTES) {
    warnings.push(`Low disk space: ${formatBytes(freeSpace.availableBytes)} available.`);
  }

  return warnings;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

module.exports = {
  MIN_RECOMMENDED_FREE_BYTES,
  prepareRenderWorkspace,
  writeOutputSidecar,
  promoteTempOutput,
  cleanupPartialOutput,
  inspectOutput,
  createCollisionSafePath,
  formatBytes
};
