import type { spawn } from 'node:child_process'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app, BrowserWindow, session } from 'electron'
import { editSelection } from './claude/editSelection'
import { buildCspResponseHeaders } from './csp'
import { createAuthService } from './github/authService'
import { CREDENTIALS_FILE } from './github/const'
import { createCredentialStore } from './github/credentialStore'
import { registerClaudeHandlers } from './ipc/claudeHandlers'
import { confirmDiscard, registerFileHandlers } from './ipc/fileHandlers'
import { registerGitHubHandlers } from './ipc/githubHandlers'
import { installApplicationMenu } from './menu'
import { MENU_CHANNELS } from '../shared/ipc'

let mainWindow: BrowserWindow | null = null

function createWindow(devRendererUrl: string | undefined): void {
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

/**
 * Wires the whole main process: CSP headers, IPC handlers, and window
 * lifecycle. `spawnFn` is injected so unit tests never touch a real child
 * process; index.ts passes the real `spawn`.
 */
export function bootstrap(spawnFn: typeof spawn): void {
  // Set by electron-vite in dev; production loads the built renderer from disk.
  const devRendererUrl = process.env.ELECTRON_RENDERER_URL

  app.whenReady().then(() => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback(buildCspResponseHeaders(details.responseHeaders, Boolean(devRendererUrl)))
    })

    const fileState = registerFileHandlers(() => mainWindow!)
    registerClaudeHandlers((request) => editSelection(request, spawnFn))

    registerGitHubHandlers(
      createAuthService({
        fetchFn: fetch,
        store: createCredentialStore(join(app.getPath('userData'), CREDENTIALS_FILE), {
          readFile,
          writeFile,
          rm,
        }),
      })
    )

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

    createWindow(devRendererUrl)

    installApplicationMenu((action) => mainWindow!.webContents.send(MENU_CHANNELS.action, action))

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow(devRendererUrl)
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
