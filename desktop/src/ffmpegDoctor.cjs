const { execFile } = require('node:child_process');
const path = require('node:path');

const DEFAULT_CANDIDATES = [
  process.env.FOTOBEAT_FFMPEG_PATH,
  'ffmpeg',
  process.platform === 'win32' ? 'ffmpeg.exe' : null
].filter(Boolean);

async function getFfmpegStatus(options = {}) {
  const candidates = normalizeCandidates(options.candidates ?? DEFAULT_CANDIDATES);
  const attempts = [];

  for (const candidate of candidates) {
    const attempt = await probeFfmpeg(candidate);
    attempts.push(attempt);

    if (attempt.available) {
      return {
        available: true,
        binary: candidate,
        version: attempt.version,
        banner: attempt.banner,
        attempts,
        checkedAt: new Date().toISOString(),
        installHint: null
      };
    }
  }

  return {
    available: false,
    binary: null,
    version: null,
    banner: null,
    attempts,
    checkedAt: new Date().toISOString(),
    installHint: getInstallHint()
  };
}

async function probeFfmpeg(binary) {
  try {
    const result = await execFileSafe(binary, ['-version'], { timeoutMs: 5000 });
    const banner = `${result.stdout}\n${result.stderr}`.trim();
    const firstLine = banner.split('\n')[0] ?? '';

    return {
      binary,
      available: true,
      version: parseVersion(firstLine),
      banner: firstLine,
      exitCode: result.exitCode,
      error: null
    };
  } catch (error) {
    return {
      binary,
      available: false,
      version: null,
      banner: null,
      exitCode: error.exitCode ?? null,
      error: error.message
    };
  }
}

function execFileSafe(binary, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = execFile(binary, args, {
      windowsHide: true,
      timeout: options.timeoutMs ?? 5000,
      maxBuffer: 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve({
        stdout,
        stderr,
        exitCode: child.exitCode ?? 0
      });
    });
  });
}

function normalizeCandidates(candidates) {
  return [...new Set(candidates.filter(Boolean).map((candidate) => candidate.trim()).filter(Boolean))];
}

function parseVersion(firstLine) {
  const match = firstLine.match(/ffmpeg version\s+([^\s]+)/i);
  return match?.[1] ?? null;
}

function getInstallHint() {
  if (process.platform === 'win32') {
    return 'Install FFmpeg for Windows and add ffmpeg.exe to PATH, or set FOTOBEAT_FFMPEG_PATH to the full binary path.';
  }

  if (process.platform === 'darwin') {
    return 'Install FFmpeg with Homebrew: brew install ffmpeg, or set FOTOBEAT_FFMPEG_PATH.';
  }

  return 'Install FFmpeg through your package manager, for example: sudo apt install ffmpeg, or set FOTOBEAT_FFMPEG_PATH.';
}

function resolveBundledFfmpegPath(resourcesPath) {
  if (!resourcesPath) return null;

  const binaryName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  return path.join(resourcesPath, 'ffmpeg', binaryName);
}

module.exports = {
  getFfmpegStatus,
  probeFfmpeg,
  resolveBundledFfmpegPath
};
