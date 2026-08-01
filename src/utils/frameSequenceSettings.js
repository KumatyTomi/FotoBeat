export const FRAME_SEQUENCE_LIMITS = {
  minSeconds: 1,
  maxSeconds: 90,
  minFps: 1,
  maxFps: 30,
  maxFrameCount: 2700
};

export const FRAME_SEQUENCE_PRESETS = [
  {
    id: 'preview',
    label: 'Szybki test',
    description: '5s @ 12 fps',
    seconds: 5,
    fps: 12
  },
  {
    id: 'mp4-poc',
    label: 'MP4 POC',
    description: '30s @ 30 fps',
    seconds: 30,
    fps: 30
  },
  {
    id: 'desktop-production',
    label: 'Desktop 9:16',
    description: '90s @ 30 fps',
    seconds: 90,
    fps: 30
  }
];

export const DEFAULT_FRAME_SEQUENCE_PRESET_ID = 'preview';

export function getFrameSequencePreset(presetId = DEFAULT_FRAME_SEQUENCE_PRESET_ID) {
  return FRAME_SEQUENCE_PRESETS.find((preset) => preset.id === presetId) ?? FRAME_SEQUENCE_PRESETS[0];
}

export function normalizeFrameSequenceSettings(settings = {}, limits = FRAME_SEQUENCE_LIMITS) {
  const requestedSeconds = toFiniteNumber(settings.seconds, getFrameSequencePreset().seconds);
  const requestedFps = toFiniteNumber(settings.fps, getFrameSequencePreset().fps);
  const roundedSeconds = Math.round(requestedSeconds);
  const roundedFps = Math.round(requestedFps);
  const seconds = clamp(roundedSeconds, limits.minSeconds, limits.maxSeconds);
  const fps = clamp(roundedFps, limits.minFps, limits.maxFps);
  const requestedFrameCount = Math.max(1, Math.ceil(seconds * fps));
  const valueClamped = seconds !== roundedSeconds || fps !== roundedFps;

  if (requestedFrameCount <= limits.maxFrameCount) {
    return {
      seconds,
      fps,
      frameCount: requestedFrameCount,
      clamped: valueClamped,
      message: valueClamped
        ? `Ustawienia sekwencji ograniczono do ${seconds}s @ ${fps} fps.`
        : ''
    };
  }

  const safeSeconds = Math.max(limits.minSeconds, Math.floor(limits.maxFrameCount / fps));

  return {
    seconds: safeSeconds,
    fps,
    frameCount: Math.max(1, Math.ceil(safeSeconds * fps)),
    clamped: true,
    message: `Limit sekwencji to ${limits.maxFrameCount} klatek. Skrócono render do ${safeSeconds}s @ ${fps} fps.`
  };
}

export function describeFrameSequenceSettings(settings) {
  const normalized = normalizeFrameSequenceSettings(settings);
  return `${normalized.seconds}s @ ${normalized.fps} fps · ${normalized.frameCount} klatek`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toFiniteNumber(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
