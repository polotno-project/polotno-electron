import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const designFilters = [{ name: 'Polotno design', extensions: ['json'] }];

ipcMain.handle('files:open-design', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: designFilters,
  });
  if (canceled) return null;
  return fs.readFile(filePaths[0], 'utf8');
});

ipcMain.handle('files:save-design', async (_event, json) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: 'design.json',
    filters: designFilters,
  });
  if (canceled) return null;
  await fs.writeFile(filePath, json, 'utf8');
  return filePath;
});

// Exports arrive as base64 data URLs from store.toDataURL() / store.toPDFDataURL().
ipcMain.handle('files:save-export', async (_event, name, dataUrl) => {
  const { canceled, filePath } = await dialog.showSaveDialog({ defaultPath: name });
  if (canceled) return null;
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  await fs.writeFile(filePath, Buffer.from(base64, 'base64'));
  return filePath;
});

// Menu clicks receive the window they were made in.
const sendCommand = (command) => (_item, window) =>
  window?.webContents.send('menu-command', command);

const buildMenu = () =>
  Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: sendCommand('open') },
        { label: 'Save…', accelerator: 'CmdOrCtrl+S', click: sendCommand('save') },
        { type: 'separator' },
        { label: 'Export PNG…', click: sendCommand('export-png') },
        { label: 'Export PDF…', click: sendCommand('export-pdf') },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ]);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.whenReady().then(() => {
  Menu.setApplicationMenu(buildMenu());
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
