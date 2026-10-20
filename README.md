# Polotno Electron Demo

Electron desktop app that runs the Polotno design editor in the renderer. A native **File** menu opens and saves designs as `.json` files and exports PNG and PDF through the main process.

## Prerequisites

- Node.js 20+ and npm
- macOS, Windows or Linux

## Running

```bash
npm install
npm start
```

`npm run make` builds an installer for the current platform with Electron Forge.

> **Note:** Set your Polotno API key before running. Create one at [polotno.com/cabinet](https://polotno.com/cabinet), then add `VITE_POLOTNO_KEY=your-key` to `.env.local`. In the cabinet, add these to the key's allowed domains:
>
> - `localhost` – `npm start` serves the renderer from the Vite dev server
> - `electron` – the packaged app loads the renderer from `file://`, which Polotno reports as `electron`
>
> Without them, the editor shows a license warning and the photo and template panels stay empty.

## Project layout

| Path               | Role                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `src/main.js`      | Window, File menu, open/save dialogs, writes files to disk           |
| `src/preload.js`   | `window.files` – the only API the renderer gets, via `contextBridge` |
| `src/editor.jsx`   | The Polotno store and editor UI                                      |
| `src/renderer.jsx` | Mounts the editor and runs File menu commands                        |

## How it works

- **No WebView bridge.** Electron's renderer is Chromium, so it imports `polotno` like any React app.
- **Menu → renderer.** Menu items send a `menu-command` IPC message to the window they were clicked in. The renderer runs the command against the store.
- **Renderer → disk.** `store.toJSON()`, `store.toDataURL()` and `store.toPDFDataURL()` produce the design and exports. The renderer passes them to `window.files`, and the main process shows a save dialog and writes the file.
- **Isolation stays on.** `contextIsolation` is on and `nodeIntegration` is off (Electron's defaults). The renderer has no Node.js access.

Docs: https://polotno.com/docs/electron
