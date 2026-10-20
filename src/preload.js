// Exposes a small file API to the renderer. The renderer gets these
// functions only: no Node.js, no direct ipcRenderer access.
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('files', {
  openDesign: () => ipcRenderer.invoke('files:open-design'),
  saveDesign: (json) => ipcRenderer.invoke('files:save-design', json),
  saveExport: (name, dataUrl) => ipcRenderer.invoke('files:save-export', name, dataUrl),
  onMenuCommand: (callback) =>
    ipcRenderer.on('menu-command', (_event, command) => callback(command)),
});
