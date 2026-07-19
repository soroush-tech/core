import { join } from 'node:path'
import { app, BrowserWindow, session } from 'electron'
import { buildCspResponseHeaders } from './csp'

// Set by electron-vite in dev; production loads the built renderer from disk.
const devRendererUrl = process.env.ELECTRON_RENDERER_URL

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })

  if (devRendererUrl) window.loadURL(devRendererUrl)
  else window.loadFile(join(import.meta.dirname, '../renderer/index.html'))
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback(buildCspResponseHeaders(details.responseHeaders, Boolean(devRendererUrl)))
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
