import { createRoot } from 'react-dom/client';
import { Editor, store } from './editor';
import './index.css';

createRoot(document.getElementById('root')).render(<Editor />);

// File menu commands arrive from the main process.
const commands = {
  open: async () => {
    const json = await window.files.openDesign();
    if (json) store.loadJSON(JSON.parse(json));
  },
  save: () => window.files.saveDesign(JSON.stringify(store.toJSON())),
  'export-png': async () =>
    window.files.saveExport('design.png', await store.toDataURL({ pixelRatio: 2 })),
  'export-pdf': async () =>
    window.files.saveExport('design.pdf', await store.toPDFDataURL()),
};

window.files.onMenuCommand(async (command) => {
  try {
    await commands[command]?.();
  } catch (error) {
    console.error(`${command} failed`, error);
  }
});
