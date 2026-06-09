const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fotobeatDesktop', {
  getVersion: () => ipcRenderer.invoke('fotobeat:get-version'),
  pickOutputFolder: () => ipcRenderer.invoke('fotobeat:pick-output-folder'),
  createLocalRenderJob: (payload) => ipcRenderer.invoke('fotobeat:create-local-render-job', payload),
  getLocalRenderJob: (jobId) => ipcRenderer.invoke('fotobeat:get-local-render-job', jobId)
});
