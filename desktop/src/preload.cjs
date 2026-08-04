const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fotobeatDesktop', {
  getVersion: () => ipcRenderer.invoke('fotobeat:get-version'),
  getFfmpegStatus: () => ipcRenderer.invoke('fotobeat:get-ffmpeg-status'),
  pickOutputFolder: () => ipcRenderer.invoke('fotobeat:pick-output-folder'),
  createLocalRenderJob: (payload) => ipcRenderer.invoke('fotobeat:create-local-render-job', payload),
  getLocalRenderJob: (jobId) => ipcRenderer.invoke('fotobeat:get-local-render-job', jobId),
  appendLocalRenderJobFrames: (jobId, frames, options) => ipcRenderer.invoke('fotobeat:append-local-render-job-frames', jobId, frames, options),
  cancelLocalRenderJob: (jobId) => ipcRenderer.invoke('fotobeat:cancel-local-render-job', jobId),
  retryLocalRenderJob: (jobId, jobFolder) => ipcRenderer.invoke('fotobeat:retry-local-render-job', jobId, jobFolder),
  createRenderSupportBundle: (jobId, jobFolder) => ipcRenderer.invoke('fotobeat:create-render-support-bundle', jobId, jobFolder),
  listRenderHistory: (limit) => ipcRenderer.invoke('fotobeat:list-render-history', limit),
  clearRenderHistory: () => ipcRenderer.invoke('fotobeat:clear-render-history'),
  showItemInFolder: (targetPath) => ipcRenderer.invoke('fotobeat:show-item-in-folder', targetPath),
  openPath: (targetPath) => ipcRenderer.invoke('fotobeat:open-path', targetPath)
});
