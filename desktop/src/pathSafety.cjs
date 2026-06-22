const path = require('node:path');
const { listRenderHistory } = require('./jobHistory.cjs');

const knownOutputRoots = new Set();

function rememberOutputRoot(rootPath) {
  const normalized = normalizeLocalPath(rootPath);
  if (normalized) knownOutputRoots.add(normalized);
}

function rememberJobRoots(job) {
  if (!job) return;
  [job.outputFolder, job.jobFolder].forEach(rememberOutputRoot);
}

function rememberHistoryRoots(history = []) {
  history.forEach((entry) => {
    [entry.outputFolder, entry.jobFolder, entry.frameImport?.framesFolder].forEach(rememberOutputRoot);
  });
}

async function assertKnownRenderPath(targetPath) {
  const normalized = assertSafeLocalPath(targetPath);
  rememberHistoryRoots(await listRenderHistory());

  if (!isUnderKnownRoot(normalized)) {
    throw new Error('Path is outside known FotoBeat render workspaces.');
  }

  return normalized;
}

function assertSafeLocalPath(targetPath) {
  const normalized = normalizeLocalPath(targetPath);

  if (!normalized) {
    throw new Error('Local path is required.');
  }

  if (!path.isAbsolute(normalized)) {
    throw new Error('Only absolute local paths are allowed.');
  }

  return normalized;
}

function normalizeLocalPath(targetPath) {
  if (!targetPath || typeof targetPath !== 'string') return null;
  return path.resolve(targetPath);
}

function isUnderKnownRoot(targetPath) {
  const normalizedTarget = normalizeForCompare(targetPath);

  for (const rootPath of knownOutputRoots) {
    const normalizedRoot = normalizeForCompare(rootPath);
    if (normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`)) {
      return true;
    }
  }

  return false;
}

function normalizeForCompare(targetPath) {
  const normalized = path.resolve(targetPath);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

module.exports = {
  assertKnownRenderPath,
  assertSafeLocalPath,
  isUnderKnownRoot,
  normalizeLocalPath,
  rememberHistoryRoots,
  rememberJobRoots,
  rememberOutputRoot
};
