export function buildProjectDiagnostics({ project, timeline, audioAnalysis, mediaQualityReport, renderReadiness, storageHealth }) {
  const issues = [];
  const suggestions = [];

  if (!project?.name?.trim()) {
    issues.push({ level: 'warning', message: 'Projekt nie ma nazwy.' });
  }

  if (!timeline?.clips?.length) {
    issues.push({ level: 'critical', message: 'Timeline nie ma klipów.' });
  }

  if (timeline?.estimatedDuration > 30) {
    suggestions.push('Aktualny WebM recorder ogranicza nagranie do 30 sekund. Dłuższe projekty wymagają ffmpeg.wasm albo render queue z segmentami.');
  }

  if (audioAnalysis?.analysisMode === 'energy-fallback') {
    suggestions.push('Audio używa trybu fallback. Warto zweryfikować beat grid ręcznie.');
  }

  if (mediaQualityReport?.warnings?.length) {
    mediaQualityReport.warnings.forEach((message) => issues.push({ level: 'warning', message }));
  }

  if (renderReadiness?.blockers?.length) {
    renderReadiness.blockers.forEach((message) => issues.push({ level: 'critical', message }));
  }

  if (renderReadiness?.warnings?.length) {
    renderReadiness.warnings.forEach((message) => issues.push({ level: 'warning', message }));
  }

  if (storageHealth?.warningLevel === 'critical') {
    issues.push({ level: 'critical', message: 'Przeglądarka ma prawie pełne local storage / IndexedDB.' });
  }

  return {
    generatedAt: new Date().toISOString(),
    health: issues.some((issue) => issue.level === 'critical') ? 'blocked' : issues.length ? 'warning' : 'ok',
    issueCount: issues.length,
    criticalCount: issues.filter((issue) => issue.level === 'critical').length,
    warningCount: issues.filter((issue) => issue.level === 'warning').length,
    issues,
    suggestions
  };
}

export function summarizeDiagnostics(diagnostics) {
  if (!diagnostics) return 'Brak diagnostyki projektu.';
  if (diagnostics.health === 'blocked') return `Projekt wymaga napraw: ${diagnostics.criticalCount} krytycznych problemów.`;
  if (diagnostics.health === 'warning') return `Projekt ma ostrzeżenia: ${diagnostics.warningCount} punktów do sprawdzenia.`;
  return 'Projekt wygląda poprawnie do eksportu preview.';
}
