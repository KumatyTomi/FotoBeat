const path = require('node:path');

function buildRenderPlan(job) {
  const manifest = job.manifest ?? {};
  const sequence = manifest.sequence ?? null;
  const format = manifest.format ?? {};
  const audio = manifest.audio ?? null;
  const renderProfile = normalizeRenderProfile(manifest.renderProfile);
  const targetFps = renderProfile?.fps ?? sequence?.fps ?? format.fps ?? 30;
  const fps = Math.min(sequence?.fps ?? targetFps, targetFps);
  const width = renderProfile?.width ?? sequence?.width ?? format.width ?? 1080;
  const height = renderProfile?.height ?? sequence?.height ?? format.height ?? 1920;
  const crf = renderProfile?.crf ?? 20;
  const preset = renderProfile?.preset ?? 'medium';
  const audioBitrate = renderProfile?.audioBitrate ?? '192k';
  const outputFileName = path.basename(job.outputPath ?? `fotobeat-${job.id}.mp4`);
  const outputPath = job.outputPath ?? path.join(job.jobFolder, outputFileName);
  const tempOutputPath = job.tempOutputPath ?? `${outputPath}.partial`;
  const inputMode = sequence ? 'frame-sequence' : 'manifest-preview';
  const audioInput = job.audioImport ? {
    name: audio?.name ?? job.audioImport.sourceFileName ?? 'input-audio',
    size: audio?.size ?? job.audioImport.size ?? null,
    type: audio?.type ?? job.audioImport.type ?? null,
    required: true,
    imported: true,
    path: 'audio/input-audio',
    manifestPath: job.audioImport.manifestPath ?? null
  } : audio ? {
    name: audio.name,
    size: audio.size,
    type: audio.type,
    required: false,
    imported: false,
    path: null
  } : null;

  return {
    schemaVersion: 'fotobeat.desktop.render-plan.v1',
    jobId: job.id,
    createdAt: new Date().toISOString(),
    inputMode,
    project: manifest.project ?? null,
    preset: normalizePreset(manifest.preset),
    renderProfile,
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
      audio: audioInput,
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
      tempPath: tempOutputPath,
      container: 'mp4',
      videoCodec: 'libx264',
      pixelFormat: 'yuv420p',
      audioCodec: audioInput?.imported ? 'aac' : null,
      crf,
      preset,
      audioBitrate: audioInput?.imported ? audioBitrate : null,
      renderProfileId: renderProfile?.id ?? null
    },
    ffmpeg: buildFfmpegCommand({
      inputMode,
      fps,
      width,
      height,
      outputPath: tempOutputPath,
      hasAudio: Boolean(audioInput?.imported),
      crf,
      preset,
      audioBitrate
    }),
    notes: [
      'This plan writes FFmpeg output to output.tempPath first.',
      'The render queue promotes output.tempPath to output.path only after a successful encode.',
      renderProfile ? `Render profile: ${renderProfile.label ?? renderProfile.id}.` : 'Render profile is not set; native defaults are used.',
      audioInput?.imported ? 'Audio input is imported and muxed with AAC output.' : 'Audio muxing is skipped because no binary audio input was imported.'
    ]
  };
}

function buildFfmpegCommand({ inputMode, fps, width, height, outputPath, hasAudio, crf, preset, audioBitrate }) {
  if (inputMode === 'frame-sequence') {
    const args = [
      '-y',
      '-framerate', String(fps),
      '-i', 'frames/frame_%04d.png'
    ];

    if (hasAudio) {
      args.push('-i', 'audio/input-audio');
    }

    args.push('-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`);
    args.push('-c:v', 'libx264');
    args.push('-preset', preset);
    args.push('-crf', String(crf));
    args.push('-pix_fmt', 'yuv420p');

    if (hasAudio) {
      args.push('-c:a', 'aac');
      args.push('-b:a', audioBitrate);
      args.push('-shortest');
    }

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

function normalizeRenderProfile(profile) {
  if (!profile) return null;

  return {
    id: profile.id ?? null,
    label: profile.label ?? null,
    quality: profile.quality ?? null,
    target: profile.target ?? null,
    width: toFiniteNumber(profile.width),
    height: toFiniteNumber(profile.height),
    fps: toFiniteNumber(profile.fps),
    crf: toFiniteNumber(profile.crf),
    preset: profile.preset ?? null,
    audioBitrate: profile.audioBitrate ?? null
  };
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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
