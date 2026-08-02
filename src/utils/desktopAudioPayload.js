export const DESKTOP_AUDIO_LIMITS = Object.freeze({
  maxBytes: 60 * 1024 * 1024,
});

export function getSelectedDesktopAudioFile(source = globalThis) {
  const candidate =
    source?.window?.__fotobeatDesktopAudioFile ??
    source?.__fotobeatDesktopAudioFile ??
    null;
  return isDesktopAudioFileLike(candidate) ? candidate : null;
}

export function validateDesktopAudioPayload(
  audioFile,
  limits = DESKTOP_AUDIO_LIMITS
) {
  if (!audioFile) return { ok: true, size: 0 };

  if (!isDesktopAudioFileLike(audioFile)) {
    return {
      ok: false,
      message: 'Plik audio nie ma poprawnego binary payload.',
    };
  }

  const size = Number(audioFile.size);
  if (!Number.isFinite(size) || size <= 0) {
    return {
      ok: false,
      message: 'Plik audio jest pusty albo nie ma poprawnego rozmiaru.',
    };
  }

  const maxBytes = resolveMaxBytes(limits);
  if (size > maxBytes) {
    return {
      ok: false,
      message: `Audio ma ${formatBytes(size)}. Limit desktop IPC to ${formatBytes(maxBytes)}.`,
    };
  }

  return { ok: true, size };
}

export async function createDesktopAudioFilePayload(
  audioFile,
  limits = DESKTOP_AUDIO_LIMITS
) {
  if (!audioFile) return null;

  const validation = validateDesktopAudioPayload(audioFile, limits);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  return {
    name: audioFile.name ?? '',
    fileName: audioFile.name ?? 'audio.input',
    size: validation.size,
    type: audioFile.type ?? '',
    arrayBuffer: await audioFile.arrayBuffer(),
  };
}

function isDesktopAudioFileLike(candidate) {
  return Boolean(candidate) && typeof candidate.arrayBuffer === 'function';
}

function resolveMaxBytes(limits) {
  const maxBytes = Number(limits?.maxBytes);
  return Number.isFinite(maxBytes) && maxBytes > 0
    ? maxBytes
    : DESKTOP_AUDIO_LIMITS.maxBytes;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
