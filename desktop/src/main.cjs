const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const { getFfmpegStatus, resolveBundledFfmpegPath } = require('./ffmpegDoctor.cjs');
const { clearRenderHistory, listRenderHistory } = require('./jobHistory.cjs');
const { assertKnownRenderPath, rememberHistoryRoots, rememberJobRoots, rememberOutputRoot } = require('./pathSafety.cjs');
const {
  appendLocalRenderJobFrames,
  cancelLocalRenderJob,
  createLocalRenderJob,
  getLocalRenderJob,
  retryLocalRenderJob
} = require('./renderQueue.cjs');
const { createMainWindow } = require('./windowFactory.cjs');

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

  ipcMain.handle('fotobeat:append-local-render-job-frames', async (_event, jobId, frames, options) => {
    const job = await appendLocalRenderJobFrames(jobId, frames, options);
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
