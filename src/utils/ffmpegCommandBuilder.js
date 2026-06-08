export function buildImageSequenceMp4Command({
  fps,
  width,
  height,
  inputPattern = 'frames/frame_%04d.png',
  outputName = 'output.mp4',
  crf = 23,
  preset = 'veryfast'
}) {
  return [
    '-framerate', String(fps),
    '-i', inputPattern,
    '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`,
    '-c:v', 'libx264',
    '-preset', preset,
    '-crf', String(crf),
    '-movflags', '+faststart',
    outputName
  ];
}

export function buildImageSequenceMp4WithAudioCommand({
  fps,
  width,
  height,
  inputPattern = 'frames/frame_%04d.png',
  audioName = 'audio.input',
  outputName = 'output.mp4',
  crf = 23,
  preset = 'veryfast',
  duration
}) {
  const command = [
    '-framerate', String(fps),
    '-i', inputPattern,
    '-i', audioName,
    '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`,
    '-c:v', 'libx264',
    '-preset', preset,
    '-crf', String(crf),
    '-c:a', 'aac',
    '-shortest'
  ];

  if (duration) {
    command.push('-t', String(duration));
  }

  command.push('-movflags', '+faststart', outputName);
  return command;
}

export function buildFfmpegVirtualFilePlan(sequence) {
  const frames = sequence.frames.map((frame, index) => ({
    sourceIndex: index,
    sourceName: frame.fileName,
    virtualPath: `frames/frame_${String(index + 1).padStart(4, '0')}.png`,
    size: frame.size ?? frame.blob?.size ?? 0
  }));

  return {
    sequenceId: sequence.id,
    frameCount: frames.length,
    inputPattern: 'frames/frame_%04d.png',
    frames
  };
}

export function commandToShellString(command) {
  return ['ffmpeg', ...command].map(quoteShellArg).join(' ');
}

function quoteShellArg(value) {
  const text = String(value);
  if (/^[a-zA-Z0-9_./:=+%-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, "'\\''")}'`;
}
