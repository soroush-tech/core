import type { spawn } from 'node:child_process'
import { MENU_CHANNELS } from '../shared/ipc'
import { editSelection } from './claude/editSelection'
import { CREDENTIALS_FILE } from './github/const'
import { createCredentialStore } from './github/credentialStore'
import { registerClaudeHandlers } from './ipc/claudeHandlers'
import { confirmDiscard, registerFileHandlers } from './ipc/fileHandlers'
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

    constructor(options: { webPreferences: Record<string, unknown> }) {
      this.options = options
      FakeBrowserWindow.created.push(this)
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
vi.mock('./ipc/githubHandlers', () => ({ registerGitHubHandlers: vi.fn() }))
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
    vi.mocked(registerFileHandlers).mockReturnValue({ isDirty: false })
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

  it('lets a clean window close through', async () => {
    await start()
    const { close, closeEvent, window } = interceptWindow()
    close()
    expect(closeEvent.preventDefault).not.toHaveBeenCalled()
    expect(window.destroy).not.toHaveBeenCalled()
  })

  it('destroys a dirty window once the user discards', async () => {
    vi.mocked(registerFileHandlers).mockReturnValue({ isDirty: true })
    vi.mocked(confirmDiscard).mockResolvedValue(true)
    await start()
    const { close, closeEvent, window } = interceptWindow()
    close()
    await flushWhenReady()
    expect(closeEvent.preventDefault).toHaveBeenCalled()
    expect(window.destroy).toHaveBeenCalled()
  })

  it('keeps a dirty window open when the user cancels', async () => {
    vi.mocked(registerFileHandlers).mockReturnValue({ isDirty: true })
    vi.mocked(confirmDiscard).mockResolvedValue(false)
    await start()
    const { close, window } = interceptWindow()
    close()
    await flushWhenReady()
    expect(window.destroy).not.toHaveBeenCalled()
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
