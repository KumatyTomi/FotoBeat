const EXPORT_ROUTE_ORDER = ['native-mp4', 'mp4-poc', 'webm', 'zip-frames'];

export function buildExportHubPlan({
  sequences = [],
  desktopAvailable = false,
  ffmpegReady = false,
  mp4Busy = false,
  zipBusy = false,
  webmBusy = false,
  audioAvailable = false
} = {}) {
  const latestSequence = findLatestSequence(sequences);
  const actions = [
    buildNativeMp4Action({ latestSequence, desktopAvailable, ffmpegReady }),
    buildMp4PocAction({ latestSequence, mp4Busy, audioAvailable }),
    buildWebmAction({ webmBusy, audioAvailable }),
    buildZipAction({ latestSequence, zipBusy })
  ];
  const recommended = actions.find((action) => action.ready) ?? null;

  return {
    schemaVersion: 'fotobeat.export-hub.v1',
    latestSequence,
    recommended,
    actions,
    summary: recommended
      ? `Rekomendowana ścieżka: ${recommended.label}.`
      : 'Brak gotowej ścieżki eksportu. Wyrenderuj sekwencję PNG albo sprawdź status desktop/FFmpeg.'
  };
}

export function describeExportHubAction(action) {
  if (!action) return 'Brak akcji eksportu.';
  if (action.ready) return action.description;
  return action.blockers.join(' ');
}

function buildNativeMp4Action({ latestSequence, desktopAvailable, ffmpegReady }) {
  const blockers = [];
  if (!latestSequence) blockers.push('Wymaga zapisanej sekwencji PNG.');
  if (!desktopAvailable) blockers.push('Wymaga uruchomienia aplikacji przez Electron.');
  if (!ffmpegReady) blockers.push('Wymaga dostępnego lokalnego FFmpeg.');

  return createAction({
    id: 'native-mp4',
    label: 'Native MP4',
    description: 'Najlepsza ścieżka: lokalny FFmpeg, render plan, audio mux i zapis MP4 na dysku.',
    blockers
  });
}

function buildMp4PocAction({ latestSequence, mp4Busy, audioAvailable }) {
  const blockers = [];
  if (!latestSequence) blockers.push('Wymaga zapisanej sekwencji PNG.');
  if (mp4Busy) blockers.push('MP4 POC jest już w trakcie pracy.');

  return createAction({
    id: 'mp4-poc',
    label: audioAvailable ? 'MP4 POC + audio' : 'MP4 POC',
    description: audioAvailable
      ? 'Fallback przez ffmpeg.wasm z muxem aktualnego audio.'
      : 'Fallback przez ffmpeg.wasm bez audio.',
    blockers
  });
}

function buildWebmAction({ webmBusy, audioAvailable }) {
  const blockers = [];
  if (webmBusy) blockers.push('Recorder WebM jest już w trakcie pracy.');

  return createAction({
    id: 'webm',
    label: audioAvailable ? 'WebM + audio' : 'WebM',
    description: audioAvailable
      ? 'Szybki eksport preview przez MediaRecorder z audio.'
      : 'Szybki eksport preview przez MediaRecorder bez audio.',
    blockers
  });
}

function buildZipAction({ latestSequence, zipBusy }) {
  const blockers = [];
  if (!latestSequence) blockers.push('Wymaga zapisanej sekwencji PNG.');
  if (zipBusy) blockers.push('ZIP frames jest już budowany.');

  return createAction({
    id: 'zip-frames',
    label: 'ZIP frames',
    description: 'Ostatni fallback: paczka PNG gotowa pod zewnętrzny FFmpeg.',
    blockers
  });
}

function createAction({ id, label, description, blockers }) {
  return {
    id,
    label,
    description,
    priority: EXPORT_ROUTE_ORDER.indexOf(id) + 1,
    ready: blockers.length === 0,
    blockers
  };
}

function findLatestSequence(sequences) {
  if (!Array.isArray(sequences) || sequences.length === 0) return null;

  return [...sequences]
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())[0] ?? null;
}
