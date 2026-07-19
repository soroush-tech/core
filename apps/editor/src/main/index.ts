import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { app, BrowserWindow, session } from 'electron'
import { editSelection } from './claude/editSelection'
import { buildCspResponseHeaders } from './csp'
import { registerClaudeHandlers } from './ipc/claudeHandlers'
import { confirmDiscard, registerFileHandlers } from './ipc/fileHandlers'

// Set by electron-vite in dev; production loads the built renderer from disk.
const devRendererUrl = process.env.ELECTRON_RENDERER_URL

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      // Sandboxed preloads must be CJS — see the preload output config in electron.vite.config.ts.
      preload: join(import.meta.dirname, '../preload/index.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })
  mainWindow = window

  if (devRendererUrl) window.loadURL(devRendererUrl)
  else window.loadFile(join(import.meta.dirname, '../renderer/index.html'))
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback(buildCspResponseHeaders(details.responseHeaders, Boolean(devRendererUrl)))
  })

  const fileState = registerFileHandlers(() => mainWindow!)
  registerClaudeHandlers((request) => editSelection(request, spawn))

  // Closing with unsaved changes prompts before the window is destroyed.
  app.on('browser-window-created', (_event, window) => {
    window.on('close', (event) => {
      if (!fileState.isDirty) return
      event.preventDefault()
      void confirmDiscard(window).then((discard) => {
        if (discard) window.destroy()
      })
    })
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
