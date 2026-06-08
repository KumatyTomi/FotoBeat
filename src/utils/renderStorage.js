const DB_NAME = 'fotobeat-render-storage';
const DB_VERSION = 1;
const STORE_NAME = 'webm-exports';

export async function saveRenderExport(exportItem) {
  const db = await openRenderDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).put(exportItem);
  await waitForTransaction(transaction);
  db.close();
}

export async function loadRenderExports(limit = 10) {
  const db = await openRenderDb();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const request = transaction.objectStore(STORE_NAME).getAll();
  const exports = await waitForRequest(request);
  await waitForTransaction(transaction);
  db.close();

  return exports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function deleteRenderExport(exportId) {
  const db = await openRenderDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).delete(exportId);
  await waitForTransaction(transaction);
  db.close();
}

export async function clearRenderExports() {
  const db = await openRenderDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).clear();
  await waitForTransaction(transaction);
  db.close();
}

export async function pruneRenderExports(limit = 10) {
  const exports = await loadRenderExports(Number.POSITIVE_INFINITY);
  const staleExports = exports.slice(limit);

  await Promise.all(staleExports.map((item) => deleteRenderExport(item.id)));
}

function openRenderDb() {
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
