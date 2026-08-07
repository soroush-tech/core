import type { spawn } from 'node:child_process'
import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app, BrowserWindow, session } from 'electron'
import { createClaudeRunner } from './claude/runEdit'
import { buildCspResponseHeaders } from './csp'
import { createAuthService } from './github/authService'
import { CREDENTIALS_FILE, DRAFTS_FILE } from './github/const'
import { createCredentialStore } from './github/credentialStore'
import { createDraftStore } from './github/draftStore'
import { createGistService } from './github/gistService'
import { registerClaudeHandlers } from './ipc/claudeHandlers'
import { confirmDiscard, registerFileHandlers } from './ipc/fileHandlers'
import { registerGistHandlers } from './ipc/gistHandlers'
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

  // A destroyed window must not be left behind the reference: on macOS the app
  // outlives its window, and the menu would go on sending to a dead one.
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null
  })

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

  app
    .whenReady()
    .then(() => {
      session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback(buildCspResponseHeaders(details.responseHeaders, Boolean(devRendererUrl)))
      })

      const fileState = registerFileHandlers(() => mainWindow!)
      registerClaudeHandlers((emit) => createClaudeRunner(spawnFn, emit))

      // One store for both services, so signing out immediately empties the gists.
      const credentialStore = createCredentialStore(
        join(app.getPath('userData'), CREDENTIALS_FILE),
        {
          readFile,
          writeFile,
          rm,
        }
      )
      registerGitHubHandlers(createAuthService({ fetchFn: fetch, store: credentialStore }))
      registerGistHandlers(
        createGistService({
          fetchFn: fetch,
          store: credentialStore,
          drafts: createDraftStore(join(app.getPath('userData'), DRAFTS_FILE), {
            readFile,
            writeFile,
            rename,
          }),
        }),
        () => mainWindow!
      )

      // Closing with unsaved changes prompts before the window is destroyed.
      app.on('browser-window-created', (_event, window) => {
        window.on('close', (event) => {
          if (!fileState.isDirty) return
          event.preventDefault()
          confirmDiscard(window, fileState.isDraft)
            .then((choice) => {
              if (choice === 'discard') return window.destroy()
              // Only the renderer can save — it owns the content and knows where the
              // document belongs. Saving leaves the window open; closing again then
              // goes straight through, with nothing unsaved.
              window.webContents.send(MENU_CHANNELS.action, 'save')
            })
            // A prompt that failed leaves the window open with the work in it:
            // the close was already prevented, and losing it would be worse.
            .catch((error: unknown) => console.error('Unsaved-changes prompt failed', error))
        })
      })

      createWindow(devRendererUrl)

      // Reload from the View menu runs the same guard as closing: a dirty
      // document prompts first, so a reload can never wipe unsaved work. As
      // with close, choosing to save leaves the window as it is — reloading
      // again then goes straight through, with nothing unsaved.
      const guardedReload = () => {
        const window = mainWindow
        if (!window) return
        if (!fileState.isDirty) return window.webContents.reload()
        confirmDiscard(window, fileState.isDraft)
          .then((choice) => {
            // The prompt does not hold the window: it can be closed, or
            // replaced as the main window, while the choice is being made —
            // and a destroyed webContents throws on both calls below.
            if (mainWindow !== window || window.isDestroyed()) return
            if (choice === 'discard') return window.webContents.reload()
            window.webContents.send(MENU_CHANNELS.action, 'save')
          })
          .catch((error: unknown) => console.error('Unsaved-changes prompt failed', error))
      }

      // The menu outlives the window on macOS, so an action with nothing to act on
      // is dropped rather than sent to a window that has been destroyed.
      installApplicationMenu(
        (action) => mainWindow?.webContents.send(MENU_CHANNELS.action, action),
        guardedReload
      )

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow(devRendererUrl)
      })
    })
    // A failure while wiring any of this must not surface as an unhandled
    // rejection: Node ends the process on those, taking the window with it.
    .catch((error: unknown) => console.error('The editor failed to start', error))

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
