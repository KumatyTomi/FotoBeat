const MP4_COMMON = {
  container: 'mp4',
  codec: 'h264/aac',
  target: 'ffmpeg-wasm'
};

export const RENDER_PROFILES = [
  {
    id: 'preview-webm-fast',
    label: 'Preview WebM Fast',
    container: 'webm',
    codec: 'vp8/opus',
    fps: 30,
    quality: 'draft',
    maxDuration: 30,
    target: 'browser-mediarecorder',
    description: 'Szybki eksport testowy z MediaRecorder. Najlepszy do podglądu i iteracji.'
  },
  {
    id: 'preview-webm-high',
    label: 'Preview WebM High',
    container: 'webm',
    codec: 'vp9/opus',
    fps: 30,
    quality: 'high',
    maxDuration: 60,
    target: 'browser-mediarecorder',
    description: 'Wyższa jakość WebM, zależna od wsparcia przeglądarki.'
  },
  {
    ...MP4_COMMON,
    id: 'mp4-poc',
    label: 'MP4 POC',
    fps: 30,
    quality: 'poc',
    maxDuration: 30,
    maxFrameCount: 900,
    crf: 23,
    preset: 'veryfast',
    audioBitrate: '160k',
    description: 'Krótki test MP4 z sekwencji PNG. Najbezpieczniejszy wariant dla ffmpeg.wasm.'
  },
  {
    ...MP4_COMMON,
    id: 'mp4-audio-poc',
    label: 'MP4 POC + audio',
    fps: 30,
    quality: 'poc',
    maxDuration: 30,
    maxFrameCount: 900,
    crf: 23,
    preset: 'veryfast',
    audioBitrate: '160k',
    description: 'Krótki test MP4 z muxem audio, ograniczony pod pamięć przeglądarki.'
  },
  {
    ...MP4_COMMON,
    id: 'mp4-mobile-vertical',
    label: 'MP4 Production 9:16',
    width: 1080,
    height: 1920,
    fps: 30,
    quality: 'production',
    maxDuration: 90,
    maxFrameCount: 2700,
    crf: 20,
    preset: 'medium',
    audioBitrate: '192k',
    description: 'Profil MP4 pod Reels, TikTok, Shorts i Stories: 1080x1920, H.264/AAC, faststart.'
  },
  {
    ...MP4_COMMON,
    id: 'mp4-wide-hd',
    label: 'MP4 Production 16:9',
    width: 1920,
    height: 1080,
    fps: 30,
    quality: 'production',
    maxDuration: 180,
    maxFrameCount: 5400,
    crf: 20,
    preset: 'medium',
    audioBitrate: '192k',
    description: 'Profil MP4 16:9 Full HD pod YouTube, ekrany i demo produktowe.'
  },
  {
    ...MP4_COMMON,
    id: 'mp4-square-social',
    label: 'MP4 Production 1:1',
    width: 1080,
    height: 1080,
    fps: 30,
    quality: 'production',
    maxDuration: 120,
    maxFrameCount: 3600,
    crf: 20,
    preset: 'medium',
    audioBitrate: '192k',
    description: 'Profil MP4 1:1 pod feed i krótsze publikacje social.'
  }
];

export function getRenderProfile(profileId) {
  return RENDER_PROFILES.find((profile) => profile.id === profileId) ?? getRenderProfile('mp4-poc');
}

export function getAvailableProfiles({ supportsMediaRecorder, supportsFfmpeg = false } = {}) {
  return RENDER_PROFILES.filter((profile) => {
    if (profile.target === 'browser-mediarecorder') return Boolean(supportsMediaRecorder);
    if (profile.target === 'ffmpeg-wasm') return Boolean(supportsFfmpeg);
    return false;
  });
}

export function isProductionMp4Profile(profileId) {
  return getRenderProfile(profileId).quality === 'production';
}
