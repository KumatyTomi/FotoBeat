export function getFfmpegReadiness({ selectedFormat, audioAnalysis, mediaQualityReport, renderProfile }) {
  const blockers = [];
  const warnings = [];

  if (!renderProfile || renderProfile.target !== 'ffmpeg-wasm') {
    warnings.push('Wybrany profil nie wymaga jeszcze ffmpeg.wasm.');
  }

  if (!selectedFormat?.width || !selectedFormat?.height) {
    blockers.push('Brak poprawnego formatu eksportu.');
  }

  if (!audioAnalysis) {
    warnings.push('Brak audio — MP4 może być eksportowany bez ścieżki dźwiękowej.');
  }

  if (!mediaQualityReport?.ready) {
    blockers.push('Brak gotowych zdjęć do renderu.');
  }

  if (mediaQualityReport?.averageScore && mediaQualityReport.averageScore < 55) {
    warnings.push('Średni score zdjęć jest niski. MP4 może mieć słabą jakość kadrowania.');
  }

  if (mediaQualityReport?.duplicateGroups?.length) {
    warnings.push('W projekcie są potencjalne duplikaty zdjęć.');
  }

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    checklist: [
      { id: 'format', label: 'Format eksportu wybrany', done: Boolean(selectedFormat?.width && selectedFormat?.height) },
      { id: 'media', label: 'Media gotowe', done: Boolean(mediaQualityReport?.ready) },
      { id: 'audio', label: 'Audio przeanalizowane albo świadomie pominięte', done: Boolean(audioAnalysis) },
      { id: 'quality', label: 'Średnia jakość mediów >= 55', done: !mediaQualityReport?.averageScore || mediaQualityReport.averageScore >= 55 },
      { id: 'profile', label: 'Profil MP4 / ffmpeg wybrany', done: renderProfile?.target === 'ffmpeg-wasm' }
    ]
  };
}
