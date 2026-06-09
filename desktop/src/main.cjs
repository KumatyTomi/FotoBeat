const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('node:path');
const { getFfmpegStatus, resolveBundledFfmpegPath } = require('./ffmpegDoctor.cjs');
const { clearRenderHistory, listRenderHistory } = require('./jobHistory.cjs');
const { createLocalRenderJob, getLocalRenderJob } = require('./renderQueue.cjs');

const DEV_URL = process.env.FOTOBEAT_DESKTOP_DEV_URL;

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

    return result.filePaths[0];
  });

  ipcMain.handle('fotobeat:create-local-render-job', async (_event, payload) => {
    return await createLocalRenderJob(payload);
  });

  ipcMain.handle('fotobeat:get-local-render-job', (_event, jobId) => {
    return getLocalRenderJob(jobId);
  });

  ipcMain.handle('fotobeat:list-render-history', async (_event, limit) => {
    return await listRenderHistory(limit);
  });

  ipcMain.handle('fotobeat:clear-render-history', async () => {
    return await clearRenderHistory();
  });

  ipcMain.handle('fotobeat:show-item-in-folder', (_event, targetPath) => {
    assertSafeLocalPath(targetPath);
    shell.showItemInFolder(targetPath);
    return { ok: true, path: targetPath };
  });

  ipcMain.handle('fotobeat:open-path', async (_event, targetPath) => {
    assertSafeLocalPath(targetPath);
    const error = await shell.openPath(targetPath);
    if (error) {
      throw new Error(error);
    }
    return { ok: true, path: targetPath };
  });
}

function assertSafeLocalPath(targetPath) {
  if (!targetPath || typeof targetPath !== 'string') {
    throw new Error('Local path is required.');
  }

  if (targetPath.includes('\0')) {
    throw new Error('Invalid local path.');
  }
}
