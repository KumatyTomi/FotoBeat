const DB_NAME = 'fotobeat-render-jobs';
const DB_VERSION = 1;
const STORE_NAME = 'jobs';

export async function saveRenderJob(job) {
  const db = await openRenderJobDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).put(job);
  await waitForTransaction(transaction);
  db.close();
}

export async function loadRenderJobs(limit = 20) {
  const db = await openRenderJobDb();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const request = transaction.objectStore(STORE_NAME).getAll();
  const jobs = await waitForRequest(request);
  await waitForTransaction(transaction);
  db.close();

  return jobs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function deleteRenderJob(jobId) {
  const db = await openRenderJobDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).delete(jobId);
  await waitForTransaction(transaction);
  db.close();
}

export async function clearRenderJobs() {
  const db = await openRenderJobDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).clear();
  await waitForTransaction(transaction);
  db.close();
}

function openRenderJobDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('target', 'target', { unique: false });
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
