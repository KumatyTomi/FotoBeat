export function buildExportManifest({
  project,
  timeline,
  selectedFormat,
  selectedPreset,
  audioAnalysis,
  mediaQualityReport,
  exportItem
}) {
  return {
    schema: 'fotobeat.export-manifest.v1',
    createdAt: new Date().toISOString(),
    project: {
      name: project.name,
      format: project.format,
      preset: project.preset,
      clipDurationScale: project.clipDurationScale ?? 1
    },
    render: {
      fileName: exportItem?.fileName ?? null,
      mimeType: exportItem?.mimeType ?? 'video/webm',
      duration: exportItem?.duration ?? timeline.estimatedDuration,
      size: exportItem?.size ?? 0,
      hasAudio: Boolean(exportItem?.hasAudio),
      format: {
        id: selectedFormat.id,
        label: selectedFormat.label,
        width: selectedFormat.width,
        height: selectedFormat.height
      },
      preset: {
        id: selectedPreset.id,
        name: selectedPreset.name
      }
    },
    timeline: {
      estimatedDuration: timeline.estimatedDuration,
      clipCount: timeline.clips.length,
      sections: summarizeSections(timeline.clips)
    },
    audio: audioAnalysis ? {
      fileName: audioAnalysis.fileName,
      bpm: audioAnalysis.bpm,
      duration: audioAnalysis.duration,
      energy: audioAnalysis.energy,
      analysisMode: audioAnalysis.analysisMode ?? 'unknown',
      transientCount: audioAnalysis.transientCount ?? 0
    } : null,
    mediaQuality: mediaQualityReport ? {
      total: mediaQualityReport.total,
      ready: mediaQualityReport.ready,
      averageScore: mediaQualityReport.averageScore,
      duplicateGroupCount: mediaQualityReport.duplicateGroups.length,
      warnings: mediaQualityReport.warnings
    } : null
  };
}

export function buildManifestDownload(manifest) {
  const json = JSON.stringify(manifest, null, 2);
  return `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
}

function summarizeSections(clips) {
  return clips.reduce((summary, clip) => {
    summary[clip.section] = (summary[clip.section] ?? 0) + 1;
    return summary;
  }, {});
}
