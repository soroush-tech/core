import type { BrowserWindow } from 'electron'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { UPDATE_CHANNELS, type Result } from '../shared/ipc'
import { startAutoUpdates, type Updater } from './updater'

const { handle } = vi.hoisted(() => ({ handle: vi.fn() }))

vi.mock('electron', () => ({ ipcMain: { handle } }))

const createUpdater = (result: Promise<unknown> = Promise.resolve(null)) => ({
  checkForUpdates: vi.fn().mockReturnValue(result),
  on: vi.fn(),
  quitAndInstall: vi.fn(),
})

const asUpdater = (updater: ReturnType<typeof createUpdater>) => updater as unknown as Updater

const createWindow = () => ({ webContents: { send: vi.fn() } }) as unknown as BrowserWindow

beforeEach(() => {
  vi.clearAllMocks()
})

describe('startAutoUpdates', () => {
  it('does nothing outside a packaged build - there is nothing to replace', () => {
    const updater = createUpdater()

    startAutoUpdates(false, asUpdater(updater), () => null)

    expect(updater.checkForUpdates).not.toHaveBeenCalled()
    expect(updater.on).not.toHaveBeenCalled()
    expect(handle).not.toHaveBeenCalled()
  })

  it('checks for updates in a packaged build', () => {
    const updater = createUpdater()

    startAutoUpdates(true, asUpdater(updater), () => null)

    expect(updater.checkForUpdates).toHaveBeenCalledOnce()
  })

  it('logs a failed check instead of letting it take the app down', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const failure = new Error('offline')

    startAutoUpdates(true, asUpdater(createUpdater(Promise.reject(failure))), () => null)
    // The rejection is handled inside the call; flush the microtask queue.
    await vi.waitFor(() => {
      expect(error).toHaveBeenCalledWith('Update check failed', failure)
    })

    error.mockRestore()
  })

  it('tells the window which version was downloaded', () => {
    const updater = createUpdater()
    const window = createWindow()

    startAutoUpdates(true, asUpdater(updater), () => window)
    const [event, onDownloaded] = updater.on.mock.calls[0] as [
      string,
      (info: { version: string }) => void,
    ]
    expect(event).toBe('update-downloaded')
    onDownloaded({ version: '0.4.0' })

    expect(window.webContents.send).toHaveBeenCalledWith(UPDATE_CHANNELS.downloaded, '0.4.0')
  })

  it('drops the downloaded notice when no window is left to show it', () => {
    const updater = createUpdater()

    startAutoUpdates(true, asUpdater(updater), () => null)
    const [, onDownloaded] = updater.on.mock.calls[0] as [
      string,
      (info: { version: string }) => void,
    ]

    expect(() => onDownloaded({ version: '0.4.0' })).not.toThrow()
  })

  it('restarts into the downloaded version when the renderer asks', () => {
    const updater = createUpdater()

    startAutoUpdates(true, asUpdater(updater), () => null)
    const [channel, install] = handle.mock.calls[0] as [string, () => Result<null>]
    expect(channel).toBe(UPDATE_CHANNELS.install)

    expect(install()).toEqual({ success: true, data: null })
    expect(updater.quitAndInstall).toHaveBeenCalledWith(true, true)
  })
})
