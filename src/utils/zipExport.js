const ZIP_STORE_METHOD = 0;
const DOS_EPOCH = new Date('1980-01-01T00:00:00Z');

export async function buildStoredZip(entries) {
  const encoder = new window.TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const fileNameBytes = encoder.encode(normalizeZipPath(entry.name));
    const data = new Uint8Array(await entry.blob.arrayBuffer());
    const crc = crc32(data);
    const timestamp = toDosDateTime(entry.lastModified ? new Date(entry.lastModified) : new Date());
    const localHeader = buildLocalFileHeader({ fileNameBytes, data, crc, timestamp });
    const centralHeader = buildCentralDirectoryHeader({ fileNameBytes, data, crc, timestamp, offset });

    localParts.push(localHeader, data);
    centralParts.push(centralHeader);
    offset += localHeader.byteLength + data.byteLength;
  }

  const centralDirectorySize = centralParts.reduce((sum, part) => sum + part.byteLength, 0);
  const centralDirectoryOffset = offset;
  const endRecord = buildEndOfCentralDirectory({
    entryCount: entries.length,
    centralDirectorySize,
    centralDirectoryOffset
  });

  return new Blob([...localParts, ...centralParts, endRecord], { type: 'application/zip' });
}

export function buildFrameSequenceZipEntries(sequence) {
  return sequence.frames.map((frame, index) => ({
    name: `frames/frame_${String(index + 1).padStart(4, '0')}.png`,
    blob: frame.blob,
    lastModified: sequence.createdAt
  })).concat({
    name: 'manifest.json',
    blob: new Blob([JSON.stringify(buildFrameSequenceManifest(sequence), null, 2)], { type: 'application/json' }),
    lastModified: sequence.createdAt
  });
}

export function buildFrameSequenceManifest(sequence) {
  return {
    schema: 'fotobeat.frame-sequence.v1',
    id: sequence.id,
    createdAt: sequence.createdAt,
    projectName: sequence.projectName,
    format: sequence.format,
    width: sequence.width,
    height: sequence.height,
    fps: sequence.fps,
    seconds: sequence.seconds,
    frameCount: sequence.frameCount,
    totalSize: sequence.totalSize,
    frames: sequence.frames.map((frame, index) => ({
      index,
      fileName: `frames/frame_${String(index + 1).padStart(4, '0')}.png`,
      time: frame.time,
      clipIndex: frame.clipIndex,
      mediaAssetName: frame.mediaAssetName,
      size: frame.size
    }))
  };
}

function buildLocalFileHeader({ fileNameBytes, data, crc, timestamp }) {
  const buffer = new ArrayBuffer(30 + fileNameBytes.byteLength);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, ZIP_STORE_METHOD, true);
  view.setUint16(10, timestamp.time, true);
  view.setUint16(12, timestamp.date, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, data.byteLength, true);
  view.setUint32(22, data.byteLength, true);
  view.setUint16(26, fileNameBytes.byteLength, true);
  view.setUint16(28, 0, true);
  bytes.set(fileNameBytes, 30);

  return bytes;
}

function buildCentralDirectoryHeader({ fileNameBytes, data, crc, timestamp, offset }) {
  const buffer = new ArrayBuffer(46 + fileNameBytes.byteLength);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, ZIP_STORE_METHOD, true);
  view.setUint16(12, timestamp.time, true);
  view.setUint16(14, timestamp.date, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, data.byteLength, true);
  view.setUint32(24, data.byteLength, true);
  view.setUint16(28, fileNameBytes.byteLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  bytes.set(fileNameBytes, 46);

  return bytes;
}

function buildEndOfCentralDirectory({ entryCount, centralDirectorySize, centralDirectoryOffset }) {
  const buffer = new ArrayBuffer(22);
  const view = new DataView(buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);

  return new Uint8Array(buffer);
}

function toDosDateTime(date) {
  const safeDate = date < DOS_EPOCH ? DOS_EPOCH : date;
  const year = safeDate.getFullYear();
  const month = safeDate.getMonth() + 1;
  const day = safeDate.getDate();
  const hours = safeDate.getHours();
  const minutes = safeDate.getMinutes();
  const seconds = Math.floor(safeDate.getSeconds() / 2);

  return {
    date: ((year - 1980) << 9) | (month << 5) | day,
    time: (hours << 11) | (minutes << 5) | seconds
  };
}

function normalizeZipPath(path) {
  return path.replace(/^\/+/, '').replace(/\\/g, '/');
}

function crc32(data) {
  let crc = 0xffffffff;

  for (let index = 0; index < data.length; index += 1) {
    crc = CRC_TABLE[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function makeCrcTable() {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
}

const CRC_TABLE = makeCrcTable();
