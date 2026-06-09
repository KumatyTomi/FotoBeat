const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('node:path');
const { getFfmpegStatus, resolveBundledFfmpegPath } = require('./ffmpegDoctor.cjs');
const { clearRenderHistory, listRenderHistory } = require('./jobHistory.cjs');
const { cancelLocalRenderJob, createLocalRenderJob, getLocalRenderJob, retryLocalRenderJob } = require('./renderQueue.cjs');

const DEV_URL = process.env.FOTOBEAT_DESKTOP_DEV_URL;
const knownOutputRoots = new Set();

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    title: 'FotoBeat.me Desktop',
    backgroundColor: '#08070d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (DEV_URL) {
    window.loadURL(DEV_URL);
    window.webContents.openDevTools({ mode: 'detach' });
    return window;
  }

  const indexPath = path.join(process.resourcesPath, 'web', 'index.html');
  window.loadFile(indexPath);
  return window;
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function registerIpcHandlers() {
  ipcMain.handle('fotobeat:get-version', () => ({
    appVersion: app.getVersion(),
    electronVersion: process.versions.electron,
    platform: process.platform
  }));

  ipcMain.handle('fotobeat:get-ffmpeg-status', async () => {
    return await getFfmpegStatus({
      candidates: [
        process.env.FOTOBEAT_FFMPEG_PATH,
        resolveBundledFfmpegPath(process.resourcesPath),
        'ffmpeg',
        process.platform === 'win32' ? 'ffmpeg.exe' : null
      ].filter(Boolean)
    });
  });

  ipcMain.handle('fotobeat:pick-output-folder', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Wybierz folder eksportu FotoBeat',
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled || !result.filePaths.length) {
      return null;
    }

    rememberOutputRoot(result.filePaths[0]);
    return result.filePaths[0];
  });

  ipcMain.handle('fotobeat:create-local-render-job', async (_event, payload) => {
    if (payload?.outputFolder) rememberOutputRoot(payload.outputFolder);
    const job = await createLocalRenderJob(payload);
    rememberJobRoots(job);
    return job;
  });

  ipcMain.handle('fotobeat:get-local-render-job', (_event, jobId) => {
    const job = getLocalRenderJob(jobId);
    rememberJobRoots(job);
    return job;
  });

  ipcMain.handle('fotobeat:cancel-local-render-job', async (_event, jobId) => {
    const job = await cancelLocalRenderJob(jobId);
    rememberJobRoots(job);
    return job;
  });

  ipcMain.handle('fotobeat:retry-local-render-job', async (_event, jobId) => {
    const job = await retryLocalRenderJob(jobId);
    rememberJobRoots(job);
    return job;
  });

  ipcMain.handle('fotobeat:list-render-history', async (_event, limit) => {
    const history = await listRenderHistory(limit);
    rememberHistoryRoots(history);
    return history;
  });

  ipcMain.handle('fotobeat:clear-render-history', async () => {
    return await clearRenderHistory();
  });

  ipcMain.handle('fotobeat:show-item-in-folder', async (_event, targetPath) => {
    const safePath = await assertKnownRenderPath(targetPath);
    shell.showItemInFolder(safePath);
    return { ok: true, path: safePath };
  });

  ipcMain.handle('fotobeat:open-path', async (_event, targetPath) => {
    const safePath = await assertKnownRenderPath(targetPath);
    const error = await shell.openPath(safePath);
    if (error) {
      throw new Error(error);
    }
    return { ok: true, path: safePath };
  });
}

function rememberOutputRoot(rootPath) {
  const normalized = normalizeLocalPath(rootPath);
  if (normalized) knownOutputRoots.add(normalized);
}

function rememberJobRoots(job) {
  if (!job) return;
  [job.outputFolder, job.jobFolder].forEach(rememberOutputRoot);
}

function rememberHistoryRoots(history = []) {
  history.forEach((entry) => {
    [entry.outputFolder, entry.jobFolder, entry.frameImport?.framesFolder].forEach(rememberOutputRoot);
  });
}

async function assertKnownRenderPath(targetPath) {
  const normalized = assertSafeLocalPath(targetPath);
  rememberHistoryRoots(await listRenderHistory());

  if (!isUnderKnownRoot(normalized)) {
    throw new Error('Path is outside known FotoBeat render workspaces.');
  }

  return normalized;
}

function assertSafeLocalPath(targetPath) {
  const normalized = normalizeLocalPath(targetPath);

  if (!normalized) {
    throw new Error('Local path is required.');
  }

  if (targetPath.includes('\0') || normalized.includes('\0')) {
    throw new Error('Invalid local path.');
  }

  if (String(targetPath).includes('://') || String(targetPath).toLowerCase().startsWith('file:')) {
    throw new Error('Only plain local filesystem paths are allowed.');
  }

  if (!path.isAbsolute(normalized)) {
    throw new Error('Only absolute local paths are allowed.');
  }

  return normalized;
}

function normalizeLocalPath(targetPath) {
  if (!targetPath || typeof targetPath !== 'string') return null;
  return path.resolve(targetPath);
}

function isUnderKnownRoot(targetPath) {
  const normalizedTarget = normalizeForCompare(targetPath);

  for (const rootPath of knownOutputRoots) {
    const normalizedRoot = normalizeForCompare(rootPath);
    if (normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`)) {
      return true;
    }
  }

  return false;
}

function normalizeForCompare(targetPath) {
  const normalized = path.resolve(targetPath);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}
