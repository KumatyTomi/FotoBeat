const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const { getFfmpegStatus } = require('./ffmpegDoctor.cjs');

async function loadRenderPlan(renderPlanPath) {
  const raw = await fs.readFile(renderPlanPath, 'utf8');
  const plan = JSON.parse(raw);
  return normalizePlanPaths(plan, path.dirname(renderPlanPath));
}

async function validateRenderPlan(plan) {
  const errors = [];
  const warnings = [];
  const workspaceDir = resolveWorkspaceDir(plan);

  if (!plan || plan.schemaVersion !== 'fotobeat.desktop.render-plan.v1') {
    errors.push('Unsupported or missing render plan schemaVersion.');
  }

  if (!plan?.output?.path) {
    errors.push('Render plan output.path is required.');
  }

  if (!plan?.output?.tempPath) {
    warnings.push('Render plan output.tempPath is missing; FFmpeg may write directly to final output.');
  }

  if (!plan?.ffmpeg?.args?.length) {
    errors.push('Render plan does not contain ffmpeg args.');
  }

  if (plan?.inputMode !== 'frame-sequence') {
    errors.push(`Unsupported inputMode for native FFmpeg renderer: ${plan?.inputMode ?? 'unknown'}.`);
  }

  const sequencePattern = plan?.inputs?.sequence?.expectedPattern;
  if (sequencePattern && workspaceDir) {
    const firstFramePath = resolveFramePatternProbe(workspaceDir, sequencePattern);
    if (!(await pathExists(firstFramePath))) {
      errors.push(`First frame not found: ${firstFramePath}`);
    }
  } else if (sequencePattern) {
    errors.push('Could not resolve workspace directory for frame sequence validation.');
  } else {
    warnings.push('No frame sequence expectedPattern found in render plan.');
  }

  const audioInput = plan?.inputs?.audio;
  if (audioInput?.required) {
    if (!audioInput.path) {
      errors.push('Audio input is required but no path was provided.');
    } else if (workspaceDir) {
      const audioPath = path.join(workspaceDir, audioInput.path);
      if (!(await pathExists(audioPath))) {
        errors.push(`Audio input not found: ${audioPath}`);
      }
    } else {
      errors.push('Could not resolve workspace directory for audio validation.');
    }
  } else if (audioInput && !audioInput.imported) {
    warnings.push('Audio metadata is present but no binary audio input was imported; rendering video-only MP4.');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

async function runNativeFfmpegRender({ renderPlanPath, ffmpegBinary, onProgress, onLog, onSpawn } = {}) {
  if (!renderPlanPath) {
    throw new Error('renderPlanPath is required.');
  }

  const plan = await loadRenderPlan(renderPlanPath);
  const ffmpeg = ffmpegBinary || (await resolveFfmpegBinary());
  const validation = await validateRenderPlan(plan);

  if (!validation.ok) {
    const error = new Error(`Render plan validation failed: ${validation.errors.join(' | ')}`);
    error.validation = validation;
    throw error;
  }

  const renderTargetPath = plan.output.tempPath ?? plan.output.path;
  await fs.mkdir(path.dirname(renderTargetPath), { recursive: true });
  onLog?.(`Starting FFmpeg: ${ffmpeg}`);
  onLog?.(plan.ffmpeg.preview);

  const startedAt = new Date().toISOString();
  const result = await spawnFfmpeg({
    binary: ffmpeg,
    args: absolutizeFfmpegArgs(plan.ffmpeg.args, plan.__workspaceDir),
    durationSeconds: plan.timing?.durationSeconds,
    onProgress,
    onLog,
    onSpawn
  });

  const finishedAt = new Date().toISOString();
  const outputStats = await inspectOutput(renderTargetPath);

  return {
    schemaVersion: 'fotobeat.desktop.native-render-result.v1',
    renderPlanPath,
    outputPath: plan.output.path,
    tempOutputPath: renderTargetPath,
    startedAt,
    finishedAt,
    ffmpeg: {
      binary: ffmpeg,
      exitCode: result.exitCode
    },
    output: outputStats,
    logs: result.logs
  };
}

async function resolveFfmpegBinary() {
  const status = await getFfmpegStatus();

  if (!status.available || !status.binary) {
    throw new Error(status.installHint || 'FFmpeg is not available.');
  }

  return status.binary;
}

function spawnFfmpeg({ binary, args, durationSeconds, onProgress, onLog, onSpawn }) {
  return new Promise((resolve, reject) => {
    const logs = [];
    const child = spawn(binary, args, {
      cwd: process.cwd(),
      windowsHide: true
    });

    onSpawn?.(child);

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      logs.push(text);
      onLog?.(text.trim());
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      logs.push(text);
      parseFfmpegProgress(text, durationSeconds, onProgress);
      onLog?.(text.trim());
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (exitCode, signal) => {
      if (exitCode === 0) {
        onProgress?.({ progress: 100, timeSeconds: durationSeconds ?? null });
        resolve({ exitCode, signal, logs });
        return;
      }

      const error = new Error(signal ? `FFmpeg was stopped by signal ${signal}` : `FFmpeg exited with code ${exitCode}`);
      error.exitCode = exitCode;
      error.signal = signal;
      error.logs = logs;
      reject(error);
    });
  });
}

function parseFfmpegProgress(text, durationSeconds, onProgress) {
  if (!durationSeconds || typeof onProgress !== 'function') return;

  const match = text.match(/time=(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
  if (!match) return;

  const [, hours, minutes, seconds] = match;
  const timeSeconds = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  const progress = Math.max(0, Math.min(100, Math.round((timeSeconds / durationSeconds) * 100)));
  onProgress({ progress, timeSeconds });
}

function normalizePlanPaths(plan, workspaceDir) {
  return {
    ...plan,
    __workspaceDir: workspaceDir,
    output: {
      ...plan.output,
      path: absolutizePath(plan.output?.path, workspaceDir),
      tempPath: absolutizePath(plan.output?.tempPath, workspaceDir)
    }
  };
}

function absolutizeFfmpegArgs(args, workspaceDir) {
  return args.map((arg) => {
    if (typeof arg !== 'string') return arg;
    if (arg === 'frames/frame_%04d.png') return path.join(workspaceDir, arg);
    if (arg === 'audio/input-audio') return path.join(workspaceDir, arg);
    return absolutizePathIfLooksLocal(arg, workspaceDir);
  });
}

function absolutizePathIfLooksLocal(value, workspaceDir) {
  if (!value || path.isAbsolute(value)) return value;
  if (value.includes('/') || value.includes('\\')) return path.join(workspaceDir, value);
  return value;
}

function absolutizePath(value, workspaceDir) {
  if (!value) return value;
  if (path.isAbsolute(value)) return value;
  return path.join(workspaceDir, value);
}

function resolveWorkspaceDir(plan) {
  if (plan?.__workspaceDir) return plan.__workspaceDir;
  if (plan?.output?.path) return path.dirname(plan.output.path);
  if (plan?.output?.tempPath) return path.dirname(plan.output.tempPath);
  return null;
}

function resolveFramePatternProbe(workspaceDir, pattern) {
  const probe = pattern.replace('%04d', '0001').replace('%05d', '00001').replace('%06d', '000001');
  return path.join(workspaceDir, probe);
}

async function inspectOutput(outputPath) {
  try {
    const stats = await fs.stat(outputPath);
    return {
      exists: true,
      sizeBytes: stats.size,
      modifiedAt: stats.mtime.toISOString(),
      path: outputPath
    };
  } catch (error) {
    return {
      exists: false,
      sizeBytes: 0,
      error: error.message,
      path: outputPath
    };
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  loadRenderPlan,
  validateRenderPlan,
  runNativeFfmpegRender
};
