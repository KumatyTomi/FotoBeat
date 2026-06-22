const { BrowserWindow } = require('electron');
const path = require('node:path');

function createMainWindow(options = {}) {
  const devUrl = options.devUrl ?? process.env.FOTOBEAT_DESKTOP_DEV_URL;
  const preloadPath = options.preloadPath ?? path.join(__dirname, 'preload.cjs');
  const resourcesPath = options.resourcesPath ?? process.resourcesPath;

  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    title: 'FotoBeat.me Desktop',
    backgroundColor: '#08070d',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (devUrl) {
    window.loadURL(devUrl);
    window.webContents.openDevTools({ mode: 'detach' });
    return window;
  }

  window.loadFile(path.join(resourcesPath, 'web', 'index.html'));
  return window;
}

module.exports = { createMainWindow };
