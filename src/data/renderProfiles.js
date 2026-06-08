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
    id: 'mp4-mobile-vertical',
    label: 'MP4 Mobile 9:16',
    container: 'mp4',
    codec: 'h264/aac',
    fps: 30,
    quality: 'production',
    maxDuration: 90,
    target: 'ffmpeg-wasm',
    description: 'Docelowy profil MP4 pod rolki, TikTok i Stories. Wymaga ffmpeg.wasm.'
  },
  {
    id: 'mp4-wide-hd',
    label: 'MP4 Wide HD 16:9',
    container: 'mp4',
    codec: 'h264/aac',
    fps: 30,
    quality: 'production',
    maxDuration: 180,
    target: 'ffmpeg-wasm',
    description: 'Docelowy profil MP4 16:9. Wymaga ffmpeg.wasm.'
  }
];

export function getRenderProfile(profileId) {
  return RENDER_PROFILES.find((profile) => profile.id === profileId) ?? RENDER_PROFILES[0];
}

export function getAvailableProfiles({ supportsMediaRecorder, supportsFfmpeg = false } = {}) {
  return RENDER_PROFILES.filter((profile) => {
    if (profile.target === 'browser-mediarecorder') return Boolean(supportsMediaRecorder);
    if (profile.target === 'ffmpeg-wasm') return Boolean(supportsFfmpeg);
    return false;
  });
}
