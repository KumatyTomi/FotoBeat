const DB_NAME = 'fotobeat-frame-sequences';
const DB_VERSION = 1;
const STORE_NAME = 'png-frame-sequences';

export async function saveFrameSequence(sequence) {
  const db = await openFrameSequenceDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).put(sequence);
  await waitForTransaction(transaction);
  db.close();
}

export async function loadFrameSequences(limit = 6) {
  const db = await openFrameSequenceDb();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const request = transaction.objectStore(STORE_NAME).getAll();
  const sequences = await waitForRequest(request);
  await waitForTransaction(transaction);
  db.close();

  return sequences
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function deleteFrameSequence(sequenceId) {
  const db = await openFrameSequenceDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).delete(sequenceId);
  await waitForTransaction(transaction);
  db.close();
}

export async function clearFrameSequences() {
  const db = await openFrameSequenceDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).clear();
  await waitForTransaction(transaction);
  db.close();
}

export async function pruneFrameSequences(limit = 6) {
  const sequences = await loadFrameSequences(Number.POSITIVE_INFINITY);
  const staleSequences = sequences.slice(limit);
  await Promise.all(staleSequences.map((sequence) => deleteFrameSequence(sequence.id)));
}

function openFrameSequenceDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function waitForRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function waitForTransaction(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
