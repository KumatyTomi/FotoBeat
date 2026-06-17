export function validateFrameSequence(sequence, limits = {}) {
  const blockers = [];
  const warnings = [];
  const maxDuration = limits.maxDuration ?? 30;
  const maxFps = limits.maxFps ?? 30;
  const maxFrameCount = limits.maxFrameCount ?? maxDuration * maxFps;

  if (!sequence) {
    return {
      valid: false,
      blockers: ['Brak sekwencji klatek.'],
      warnings: [],
      summary: 'Brak sekwencji klatek do walidacji.'
    };
  }

  if (!sequence.frames?.length) blockers.push('Sekwencja nie zawiera klatek.');
  if (!sequence.width || !sequence.height) blockers.push('Sekwencja nie ma poprawnej rozdzielczości.');
  if (!sequence.fps) blockers.push('Sekwencja nie ma ustawionego FPS.');
  if (sequence.frames?.length && sequence.frameCount !== sequence.frames.length) warnings.push('frameCount nie zgadza się z liczbą klatek.');
  if (sequence.fps > maxFps) blockers.push(`FPS ${sequence.fps} przekracza limit profilu: ${maxFps}.`);
  if (sequence.seconds > maxDuration) blockers.push(`Sekwencja ${sequence.seconds}s przekracza limit profilu: ${maxDuration}s.`);
  if (sequence.frameCount > maxFrameCount) blockers.push(`Sekwencja ma ${sequence.frameCount} klatek, limit profilu to ${maxFrameCount}.`);

  if (limits.width && limits.height && (sequence.width !== limits.width || sequence.height !== limits.height)) {
    warnings.push(`Sekwencja ma ${sequence.width}x${sequence.height}, profil docelowy użyje ${limits.width}x${limits.height}.`);
  }

  const missingBlobs = sequence.frames?.filter((frame) => !frame.blob).length ?? 0;
  if (missingBlobs) blockers.push(`${missingBlobs} klatek nie ma Blob PNG.`);

  const duplicateNames = findDuplicateFrameNames(sequence.frames ?? []);
  if (duplicateNames.length) blockers.push(`Wykryto duplikaty nazw klatek: ${duplicateNames.join(', ')}.`);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings,
    summary: blockers.length
      ? `Sekwencja zablokowana: ${blockers.length} problemów krytycznych.`
      : warnings.length
        ? `Sekwencja gotowa z ostrzeżeniami: ${warnings.length}.`
        : 'Sekwencja gotowa do ffmpeg.wasm.'
  };
}

export function getFrameSequenceStats(sequence) {
  const frames = sequence?.frames ?? [];
  const totalSize = frames.reduce((sum, frame) => sum + (frame.size ?? frame.blob?.size ?? 0), 0);
  const averageFrameSize = frames.length ? Math.round(totalSize / frames.length) : 0;

  return {
    frameCount: frames.length,
    totalSize,
    averageFrameSize,
    width: sequence?.width ?? 0,
    height: sequence?.height ?? 0,
    fps: sequence?.fps ?? 0,
    seconds: sequence?.seconds ?? 0
  };
}

function findDuplicateFrameNames(frames) {
  const seen = new Set();
  const duplicates = new Set();

  frames.forEach((frame, index) => {
    const name = frame.fileName || `frame_${String(index + 1).padStart(4, '0')}.png`;
    if (seen.has(name)) duplicates.add(name);
    seen.add(name);
  });

  return [...duplicates];
}
