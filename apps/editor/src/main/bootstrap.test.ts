import type { spawn } from 'node:child_process'
import { MENU_CHANNELS } from '../shared/ipc'
import { editSelection } from './claude/editSelection'
import { createAuthService } from './github/authService'
import { CREDENTIALS_FILE } from './github/const'
import { createCredentialStore } from './github/credentialStore'
import { createGistService } from './github/gistService'
import { registerClaudeHandlers } from './ipc/claudeHandlers'
import { confirmDiscard, registerFileHandlers } from './ipc/fileHandlers'
import { registerGistHandlers } from './ipc/gistHandlers'
import { registerGitHubHandlers } from './ipc/githubHandlers'
import { installApplicationMenu } from './menu'

const { appEvents, whenReady, quit, onHeadersReceived, FakeBrowserWindow } = vi.hoisted(() => {
  const appEvents = new Map<string, (...args: never[]) => void>()

  class FakeBrowserWindow {
    static created: FakeBrowserWindow[] = []
    static getAllWindows = vi.fn((): unknown[] => [])
    options: { webPreferences: Record<string, unknown> }
    loadURL = vi.fn()
    loadFile = vi.fn()
    webContents = { send: vi.fn() }
    listeners = new Map<string, (...args: unknown[]) => void>()
    on = vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      this.listeners.set(event, handler)
    })

    constructor(options: { webPreferences: Record<string, unknown> }) {
      this.options = options
      FakeBrowserWindow.created.push(this)
    }

    /** Fires one of the window's own events, the way Electron would. */
    emit(event: string, ...args: unknown[]) {
      this.listeners.get(event)?.(...args)
    }
  }

  return {
    appEvents,
    FakeBrowserWindow,
    whenReady: vi.fn(() => Promise.resolve()),
    quit: vi.fn(),
    onHeadersReceived: vi.fn(),
  }
})

vi.mock('electron', () => ({
  app: {
    whenReady,
    quit,
    getPath: vi.fn(() => 'C:\\userData'),
    on: (event: string, handler: (...args: never[]) => void) => {
      appEvents.set(event, handler)
    },
  },
  session: { defaultSession: { webRequest: { onHeadersReceived } } },
  BrowserWindow: FakeBrowserWindow,
}))

vi.mock('./claude/editSelection', () => ({ editSelection: vi.fn() }))
vi.mock('./github/authService', () => ({ createAuthService: vi.fn() }))
vi.mock('./github/credentialStore', () => ({ createCredentialStore: vi.fn() }))
vi.mock('./github/gistService', () => ({ createGistService: vi.fn() }))
vi.mock('./ipc/githubHandlers', () => ({ registerGitHubHandlers: vi.fn() }))
vi.mock('./ipc/gistHandlers', () => ({ registerGistHandlers: vi.fn() }))
vi.mock('./menu', () => ({ installApplicationMenu: vi.fn() }))
vi.mock('./ipc/claudeHandlers', () => ({ registerClaudeHandlers: vi.fn() }))
vi.mock('./ipc/fileHandlers', () => ({
  confirmDiscard: vi.fn(),
  registerFileHandlers: vi.fn(),
}))

const { bootstrap } = await import('./bootstrap')

const spawnFn = vi.fn() as unknown as typeof spawn
const flushWhenReady = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

const start = async () => {
  bootstrap(spawnFn)
  await flushWhenReady()
}

interface CloseEvent {
  preventDefault: () => void
}

/** Runs a window through the `browser-window-created` intercept and returns its captured pieces. */
const interceptWindow = () => {
  let closeHandler: ((event: CloseEvent) => void) | undefined
  const window = {
    on: (_event: string, handler: (event: CloseEvent) => void) => {
      closeHandler = handler
    },
    destroy: vi.fn(),
    webContents: { send: vi.fn() },
  }
  appEvents.get('browser-window-created')!(...([{}, window] as never[]))
  const closeEvent = { preventDefault: vi.fn() }
  return { window, close: () => closeHandler!(closeEvent), closeEvent }
}

const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!
const setPlatform = (value: string) =>
  Object.defineProperty(process, 'platform', { value, configurable: true })

describe('bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    appEvents.clear()
    FakeBrowserWindow.created.length = 0
    FakeBrowserWindow.getAllWindows.mockReturnValue([])
    vi.mocked(registerFileHandlers).mockReturnValue({ isDirty: false, isDraft: false })
  })

  afterAll(() => {
    Object.defineProperty(process, 'platform', originalPlatform)
  })

  it('applies the production CSP to every response', async () => {
    await start()
    const [applyCsp] = onHeadersReceived.mock.calls[0] as [
      (
        details: { responseHeaders: Record<string, string[]> },
        callback: (response: unknown) => void
      ) => void,
    ]
    const callback = vi.fn()
    applyCsp({ responseHeaders: { 'X-Existing': ['kept'] } }, callback)
    const [{ responseHeaders }] = callback.mock.calls[0] as [
      { responseHeaders: Record<string, string[]> },
    ]
    expect(responseHeaders['X-Existing']).toEqual(['kept'])
    expect(responseHeaders['Content-Security-Policy'][0]).toContain("script-src 'self'")
    expect(responseHeaders['Content-Security-Policy'][0]).not.toContain('ws:')
  })

  it('creates the window with the security baseline and loads the built renderer', async () => {
    await start()
    const [window] = FakeBrowserWindow.created
    expect(window.options.webPreferences).toMatchObject({
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    })
    expect(String(window.options.webPreferences.preload)).toContain('preload')
    expect(window.loadFile).toHaveBeenCalledWith(expect.stringContaining('index.html'))
    expect(window.loadURL).not.toHaveBeenCalled()
  })

  it('loads the dev server URL and relaxes the CSP in dev', async () => {
    vi.stubEnv('ELECTRON_RENDERER_URL', 'http://localhost:5173/')
    await start()
    const [window] = FakeBrowserWindow.created
    expect(window.loadURL).toHaveBeenCalledWith('http://localhost:5173/')
    expect(window.loadFile).not.toHaveBeenCalled()

    const [applyCsp] = onHeadersReceived.mock.calls[0] as [
      (details: { responseHeaders: undefined }, callback: (response: unknown) => void) => void,
    ]
    const callback = vi.fn()
    applyCsp({ responseHeaders: undefined }, callback)
    const [{ responseHeaders }] = callback.mock.calls[0] as [
      { responseHeaders: Record<string, string[]> },
    ]
    expect(responseHeaders['Content-Security-Policy'][0]).toContain("connect-src 'self' ws:")
  })

  it('hands the current window to the file handlers', async () => {
    await start()
    const [getWindow] = vi.mocked(registerFileHandlers).mock.calls[0]
    expect(getWindow()).toBe(FakeBrowserWindow.created[0])
  })

  it('forwards application-menu actions to the window over IPC', async () => {
    await start()
    const [send] = vi.mocked(installApplicationMenu).mock.calls[0]
    send('save')
    expect(FakeBrowserWindow.created[0].webContents.send).toHaveBeenCalledWith(
      MENU_CHANNELS.action,
      'save'
    )
  })

  it('drops a menu action once the window it would go to has closed', async () => {
    await start()
    const [send] = vi.mocked(installApplicationMenu).mock.calls[0]
    const window = FakeBrowserWindow.created[0]

    // On macOS the app outlives its window, and the menu stays installed.
    window.emit('closed')
    send('save')

    expect(window.webContents.send).not.toHaveBeenCalled()
  })

  it('wires claude edits to the injected spawn', async () => {
    await start()
    const [runEdit] = vi.mocked(registerClaudeHandlers).mock.calls[0]
    const request = { selectedText: 'text', instruction: 'shorten' }
    void runEdit(request)
    expect(editSelection).toHaveBeenCalledWith(request, spawnFn)
  })

  it('stores GitHub credentials under the app userData directory', async () => {
    await start()
    const [filePath] = vi.mocked(createCredentialStore).mock.calls[0]
    expect(filePath).toContain(CREDENTIALS_FILE)
    expect(filePath).toContain('userData')
    expect(registerGitHubHandlers).toHaveBeenCalled()
  })

  it('hands the current window to the gist handlers, for the delete prompt', async () => {
    await start()
    const [, getWindow] = vi.mocked(registerGistHandlers).mock.calls[0]
    expect(getWindow()).toBe(FakeBrowserWindow.created[0])
  })

  it('gives the auth and gist services the same credential store', async () => {
    vi.mocked(createCredentialStore).mockReturnValue('store' as never)
    await start()

    expect(createCredentialStore).toHaveBeenCalledTimes(1)
    expect(vi.mocked(createAuthService).mock.calls[0][0].store).toBe('store')
    expect(vi.mocked(createGistService).mock.calls[0][0].store).toBe('store')
    expect(registerGistHandlers).toHaveBeenCalled()
  })

  it('lets a clean window close through', async () => {
    await start()
    const { close, closeEvent, window } = interceptWindow()
    close()
    expect(closeEvent.preventDefault).not.toHaveBeenCalled()
    expect(window.destroy).not.toHaveBeenCalled()
  })

  it('destroys a dirty window once the user discards', async () => {
    vi.mocked(registerFileHandlers).mockReturnValue({ isDirty: true, isDraft: false })
    vi.mocked(confirmDiscard).mockResolvedValue('discard')
    await start()
    const { close, closeEvent, window } = interceptWindow()
    close()
    await flushWhenReady()
    expect(closeEvent.preventDefault).toHaveBeenCalled()
    expect(window.destroy).toHaveBeenCalled()
  })

  it('labels the close prompt as a draft when the document belongs to a gist', async () => {
    vi.mocked(registerFileHandlers).mockReturnValue({ isDirty: true, isDraft: true })
    vi.mocked(confirmDiscard).mockResolvedValue('discard')
    await start()
    const { close } = interceptWindow()
    close()
    await flushWhenReady()

    expect(confirmDiscard).toHaveBeenCalledWith(expect.anything(), true)
  })

  it('asks the renderer to save, and keeps the window, when the work is kept', async () => {
    vi.mocked(registerFileHandlers).mockReturnValue({ isDirty: true, isDraft: false })
    vi.mocked(confirmDiscard).mockResolvedValue('save')
    await start()
    const { close, window } = interceptWindow()
    close()
    await flushWhenReady()

    // Only the renderer can save; closing again then goes straight through.
    expect(window.webContents.send).toHaveBeenCalledWith(MENU_CHANNELS.action, 'save')
    expect(window.destroy).not.toHaveBeenCalled()
  })

  it('keeps the window open when the prompt itself fails', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(registerFileHandlers).mockReturnValue({ isDirty: true, isDraft: false })
    vi.mocked(confirmDiscard).mockRejectedValue(new Error('no window to prompt on'))
    await start()
    const { close, window } = interceptWindow()

    close()
    await flushWhenReady()

    // The close was already prevented; destroying it now would lose the work.
    expect(window.destroy).not.toHaveBeenCalled()
    expect(logged).toHaveBeenCalledWith('Unsaved-changes prompt failed', expect.any(Error))
    logged.mockRestore()
  })

  it('keeps the current window when an older one reports it closed', async () => {
    await start()
    // macOS: the window was closed and reopened through activate.
    appEvents.get('activate')!()
    const [first, second] = FakeBrowserWindow.created

    first.emit('closed')
    const [send] = vi.mocked(installApplicationMenu).mock.calls[0]
    send('save')

    expect(second.webContents.send).toHaveBeenCalledWith(MENU_CHANNELS.action, 'save')
  })

  it('reports a startup that failed rather than dying of an unhandled rejection', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    whenReady.mockRejectedValueOnce(new Error('Electron never became ready'))

    await start()

    expect(logged).toHaveBeenCalledWith('The editor failed to start', expect.any(Error))
    logged.mockRestore()
  })

  it('recreates the window on activate only when none are left', async () => {
    await start()
    const activate = appEvents.get('activate')!
    FakeBrowserWindow.getAllWindows.mockReturnValue([FakeBrowserWindow.created[0]])
    activate()
    expect(FakeBrowserWindow.created).toHaveLength(1)
    FakeBrowserWindow.getAllWindows.mockReturnValue([])
    activate()
    expect(FakeBrowserWindow.created).toHaveLength(2)
  })

  it('quits when all windows close, except on macOS', async () => {
    await start()
    const allClosed = appEvents.get('window-all-closed')!
    setPlatform('darwin')
    allClosed()
    expect(quit).not.toHaveBeenCalled()
    setPlatform('win32')
    allClosed()
    expect(quit).toHaveBeenCalled()
  })
})
