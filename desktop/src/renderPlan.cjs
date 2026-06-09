const path = require('node:path');

function buildRenderPlan(job) {
  const manifest = job.manifest ?? {};
  const sequence = manifest.sequence ?? null;
  const format = manifest.format ?? {};
  const audio = manifest.audio ?? null;
  const fps = sequence?.fps ?? 30;
  const width = sequence?.width ?? format.width ?? 1080;
  const height = sequence?.height ?? format.height ?? 1920;
  const outputFileName = `fotobeat-${job.id}.mp4`;
  const outputPath = path.join(job.jobFolder, outputFileName);
  const inputMode = sequence ? 'frame-sequence' : 'manifest-preview';

  return {
    schemaVersion: 'fotobeat.desktop.render-plan.v1',
    jobId: job.id,
    createdAt: new Date().toISOString(),
    inputMode,
    project: manifest.project ?? null,
    preset: normalizePreset(manifest.preset),
    format: {
      id: format.id ?? 'vertical',
      label: format.label ?? null,
      width,
      height,
      ratio: format.ratio ?? null
    },
    timing: {
      fps,
      durationSeconds: sequence?.seconds ?? manifest.timeline?.estimatedDuration ?? null,
      frameCount: sequence?.frameCount ?? null
    },
    inputs: {
      audio: audio ? {
        name: audio.name,
        size: audio.size,
        type: audio.type,
        required: false
      } : null,
      sequence: sequence ? {
        id: sequence.id,
        frameCount: sequence.frameCount,
        totalSize: sequence.totalSize,
        expectedPattern: 'frames/frame_%04d.png'
      } : null,
      mediaCount: countMedia(manifest.media)
    },
    output: {
      fileName: outputFileName,
      path: outputPath,
      container: 'mp4',
      videoCodec: 'libx264',
      pixelFormat: 'yuv420p',
      audioCodec: audio ? 'aac' : null
    },
    ffmpeg: buildFfmpegCommand({
      inputMode,
      fps,
      width,
      height,
      outputPath,
      hasAudio: Boolean(audio)
    }),
    notes: [
      'This is a planning artifact. The current renderer still writes a placeholder output.',
      'Native FFmpeg execution should consume this plan in the next stage.'
    ]
  };
}

function buildFfmpegCommand({ inputMode, fps, width, height, outputPath, hasAudio }) {
  if (inputMode === 'frame-sequence') {
    const args = [
      '-y',
      '-framerate', String(fps),
      '-i', 'frames/frame_%04d.png'
    ];

    if (hasAudio) {
      args.push('-i', 'audio/input-audio');
      args.push('-shortest');
      args.push('-c:a', 'aac');
      args.push('-b:a', '192k');
    }

    args.push('-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`);
    args.push('-c:v', 'libx264');
    args.push('-pix_fmt', 'yuv420p');
    args.push('-movflags', '+faststart');
    args.push(outputPath);

    return {
      binary: 'ffmpeg',
      args,
      preview: ['ffmpeg', ...args].join(' ')
    };
  }

  return {
    binary: 'ffmpeg',
    args: [],
    preview: 'frame sequence not available yet; generate PNG sequence before native FFmpeg encode'
  };
}

function normalizePreset(preset) {
  if (!preset) return null;

  return {
    id: preset.id ?? null,
    name: preset.name ?? preset.label ?? null,
    description: preset.description ?? null
  };
}

function countMedia(media) {
  if (!media) return 0;
  if (Array.isArray(media)) return media.length;
  if (Array.isArray(media.selectedImages)) return media.selectedImages.length;
  if (Array.isArray(media.mediaAssets)) return media.mediaAssets.length;
  return 0;
}

module.exports = {
  buildRenderPlan
};
