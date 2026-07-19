---
description: Security patterns, type-safe IPC, project setup, and packaging/signing guidance for Electron + React desktop apps. Use when generating Electron main/preload/renderer process code, configuring electron-vite or Electron Forge, wiring IPC between processes, implementing contextBridge/sandbox/CSP security patterns, packaging/signing/notarizing, or testing with Playwright. Do not use for Tauri apps, pure web apps with no desktop target, Electron below v20 (security defaults differ), or non-React renderers.
argument-hint: [filename]
---

## Security is the default, never opt-in

`contextIsolation: true`, `sandbox: true`, `nodeIntegration: false` on every `BrowserWindow`. Disabling any one lets an XSS in the renderer escalate to full RCE.

```ts
// ✗
new BrowserWindow({ webPreferences: { nodeIntegration: true } })

// ✓
new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.js'),
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: false,
  },
})
```

The preload path must point at the **built** output, not the source file.

---

### All renderer↔main traffic flows through `contextBridge`

Never expose `ipcRenderer` itself — wrap each channel in a named function.

```ts
// ✗ preload.ts — renderer gets full IPC access
contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)

// ✓ preload.ts — typed, named surface
contextBridge.exposeInMainWorld('electronAPI', {
  loadPreferences: () => ipcRenderer.invoke('load-prefs'),
  saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
  onUpdateCounter: (callback: (value: number) => void) => {
    const handler = (_e: IpcRendererEvent, value: number) => callback(value)
    ipcRenderer.on('update-counter', handler)
    return () => ipcRenderer.removeListener('update-counter', handler)
  },
})
```

Declare the exposed surface in a `preload/index.d.ts` so the renderer gets types without importing Electron.

---

### CSP via HTTP headers, restricted to `'self'`

```ts
// ✓ main process
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["script-src 'self'"],
    },
  })
})
```

---

## IPC: `invoke`/`handle`, never `send`/`on`, for request-response

`send`/`on` has no return value and no error propagation. Use `invoke`/`handle` for anything that produces a result.

```ts
// ✗ — no result, no error path
ipcRenderer.send('save-file', content)
ipcMain.on('save-file', (_e, content) => fs.writeFile(...))

// ✓
ipcRenderer.invoke('save-file', content)
ipcMain.handle('save-file', async (_e, content) => { ... })
```

Type the channel surface with a map so args/return can't drift between main and preload:

```ts
type IpcChannelMap = {
  'load-prefs': { args: []; return: UserPreferences }
  'save-file': { args: [content: string]; return: { success: boolean } }
}
```

For larger apps, prefer `electron-trpc` (tRPC router + Zod input validation) over hand-rolled channel maps.

---

### Wrap every IPC response in a Result type — Electron only serializes `Error.message`

```ts
// ✗ — stack, cause, custom fields all lost crossing the IPC boundary
ipcMain.handle('save-file', async (_e, content: string) => {
  await fs.writeFile(filePath, content) // throws raw Error
})

// ✓ — full error context preserved as data
ipcMain.handle('save-file', async (_e, content: string) => {
  try {
    await fs.writeFile(filePath, content)
    return { success: true, data: filePath }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
})
```

Validate every argument received from the renderer (Zod or manual checks) — it crossed a trust boundary.

Group related handlers into one module per domain:

```ts
export function registerFileHandlers(): void {
  ipcMain.handle('save-file', async (_e, content: string) => { ... })
  ipcMain.handle('load-file', async (_e, filePath: string) => { ... })
}
```

---

## React integration: IPC listeners always return a cleanup

Strict Mode double-invokes effects — an IPC listener without cleanup leaks a duplicate handler per mount.

```ts
// ✗
useEffect(() => {
  window.electronAPI.onUpdateCounter(setCount)
}, [])

// ✓
useEffect(() => {
  const cleanup = window.electronAPI.onUpdateCounter(setCount)
  return cleanup
}, [])
```

For multi-window apps, the main process is the single source of truth for shared state (`electron-store` + IPC broadcast to all windows) — never mutate state window-to-window directly.

---

## Project layout (electron-vite + Electron Forge)

```
src/
├── main/           # Node.js environment
│   ├── index.ts
│   └── ipc/        # one handler module per domain
├── preload/
│   ├── index.ts    # contextBridge surface only
│   └── index.d.ts  # types for the exposed API
└── renderer/        # pure web, no Node access
    ├── src/
    └── index.html
```

Use `electron-vite` for dev (unified main/preload/renderer config, instant HMR) and Electron Forge for packaging/signing/notarizing — not webpack-based toolchains or manual packaging.

---

## Quick reference

| Category       | Prefer                              | Avoid                               |
| -------------- | ----------------------------------- | ----------------------------------- |
| Security       | `contextBridge.exposeInMainWorld()` | `nodeIntegration: true`             |
| IPC            | `invoke`/`handle`                   | `send`/`on` for request-response    |
| Preload        | Typed named function wrappers       | Exposing raw `ipcRenderer`          |
| Build tool     | `electron-vite`                     | webpack-based toolchains            |
| Packaging      | Electron Forge                      | Manual packaging                    |
| State          | Zustand + `electron-store`          | Redux for simple apps               |
| Testing        | Playwright E2E                      | Spectron (deprecated, Electron ≤13) |
| Updates        | `electron-updater`                  | Manual update checks                |
| Error handling | `{ success, data, error }` result   | Raw `Error` across IPC              |
| Multi-window   | Main process as state hub           | Direct window-to-window mutation    |

## Anti-patterns

| Anti-pattern                      | Problem                                    | Fix                                     |
| --------------------------------- | ------------------------------------------ | --------------------------------------- |
| `nodeIntegration: true`           | XSS escalates to full RCE                  | Keep disabled (default)                 |
| Exposing `ipcRenderer` directly   | Full IPC surface reachable from renderer   | Wrap in named `contextBridge` functions |
| Missing `contextIsolation`        | Renderer can reach preload scope           | Keep enabled (default since v12)        |
| `BrowserWindow` without `sandbox` | Preload gets full Node.js access           | Enable sandbox (default since v20)      |
| Unvalidated IPC arguments         | Injection from renderer                    | Validate with Zod or manual checks      |
| Server bound to `0.0.0.0`         | Network-exposed local server               | Bind to `127.0.0.1`                     |
| Missing CSP headers               | Script injection vectors                   | Strict CSP via HTTP headers             |
| Raw `Error` returned across IPC   | Stack/cause lost, only `.message` survives | Result-type wrapper                     |
| No code signing                   | OS warnings, Gatekeeper blocks             | Sign + notarize every platform build    |
| Spectron for E2E                  | Deprecated, capped at Electron 13          | Playwright                              |

If `$ARGUMENTS` names a file, read it and apply these rules. Otherwise apply to the Electron code being discussed.
