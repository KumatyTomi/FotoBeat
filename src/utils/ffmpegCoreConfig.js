export const FFMPEG_CORE_VERSION = '0.12.10';
export const FFMPEG_CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

export async function buildFfmpegLoadOptions(toBlobURL) {
  if (!toBlobURL) return undefined;

  return {
    coreURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm')
  };
}

export function getFfmpegRuntimeNotes() {
  return [
    'ffmpeg.wasm jest ładowany lazy-load dopiero po kliknięciu eksportu MP4.',
    `Core URL bazuje na @ffmpeg/core ${FFMPEG_CORE_VERSION}.`,
    'Pierwszy POC używa krótkiej sekwencji klatek, żeby ograniczyć ryzyko pamięci.',
    'MP4 z audio jest opcjonalny i używa audioFile jako drugiego wejścia ffmpeg.'
  ];
}
