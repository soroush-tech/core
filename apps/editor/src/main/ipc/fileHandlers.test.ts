import type { BrowserWindow } from 'electron'
import { FILE_CHANNELS } from '../../shared/ipc'

const { handlers, showOpenDialog, showSaveDialog, showMessageBox } = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => unknown>(),
  showOpenDialog: vi.fn(),
  showSaveDialog: vi.fn(),
  showMessageBox: vi.fn(),
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(channel, handler)
    },
  },
  dialog: { showOpenDialog, showSaveDialog, showMessageBox },
}))

const readFile = vi.fn()
const writeFile = vi.fn()

const { confirmDiscard, registerFileHandlers } = await import('./fileHandlers')

const window = { id: 1 } as unknown as BrowserWindow
const invoke = (channel: string, ...args: unknown[]) => handlers.get(channel)!({}, ...args)

describe('registerFileHandlers', () => {
  const state = registerFileHandlers(() => window, { readFile, writeFile })

  beforeEach(() => {
    vi.clearAllMocks()
    state.isDirty = false
  })

  describe(FILE_CHANNELS.open, () => {
    it('returns null when the dialog is cancelled', async () => {
      showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] })
      await expect(invoke(FILE_CHANNELS.open)).resolves.toEqual({ success: true, data: null })
    })

    it('reads the chosen file', async () => {
      showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['C:\\notes.md'] })
      readFile.mockResolvedValue('# hi')
      await expect(invoke(FILE_CHANNELS.open)).resolves.toEqual({
        success: true,
        data: { filePath: 'C:\\notes.md', content: '# hi' },
      })
      expect(readFile).toHaveBeenCalledWith('C:\\notes.md', 'utf8')
    })

    it('wraps read failures as an error string', async () => {
      showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['C:\\notes.md'] })
      readFile.mockRejectedValue(new Error('EACCES'))
      await expect(invoke(FILE_CHANNELS.open)).resolves.toEqual({ success: false, error: 'EACCES' })
    })
  })

  describe(FILE_CHANNELS.save, () => {
    it('rejects invalid arguments', async () => {
      await expect(invoke(FILE_CHANNELS.save, null, 42)).resolves.toEqual({
        success: false,
        error: 'Invalid save arguments',
      })
      await expect(invoke(FILE_CHANNELS.save, 7, 'text')).resolves.toEqual({
        success: false,
        error: 'Invalid save arguments',
      })
    })

    it('writes straight to a known path', async () => {
      writeFile.mockResolvedValue(undefined)
      await expect(invoke(FILE_CHANNELS.save, 'C:\\notes.md', 'body')).resolves.toEqual({
        success: true,
        data: { filePath: 'C:\\notes.md' },
      })
      expect(writeFile).toHaveBeenCalledWith('C:\\notes.md', 'body', 'utf8')
      expect(showSaveDialog).not.toHaveBeenCalled()
    })

    it('prompts for a path when none is given, and honors cancel', async () => {
      showSaveDialog.mockResolvedValue({ canceled: true, filePath: undefined })
      await expect(invoke(FILE_CHANNELS.save, null, 'body')).resolves.toEqual({
        success: true,
        data: null,
      })
      expect(writeFile).not.toHaveBeenCalled()
    })

    it('writes to the path chosen in the dialog', async () => {
      showSaveDialog.mockResolvedValue({ canceled: false, filePath: 'C:\\new.md' })
      writeFile.mockResolvedValue(undefined)
      await expect(invoke(FILE_CHANNELS.save, null, 'body')).resolves.toEqual({
        success: true,
        data: { filePath: 'C:\\new.md' },
      })
      expect(writeFile).toHaveBeenCalledWith('C:\\new.md', 'body', 'utf8')
    })

    it('wraps write failures as an error string', async () => {
      writeFile.mockRejectedValue(new Error('ENOSPC'))
      await expect(invoke(FILE_CHANNELS.save, 'C:\\notes.md', 'body')).resolves.toEqual({
        success: false,
        error: 'ENOSPC',
      })
    })
  })

  describe(FILE_CHANNELS.setDirty, () => {
    it('mirrors a strict boolean into the handler state', () => {
      expect(invoke(FILE_CHANNELS.setDirty, true)).toEqual({ success: true, data: null })
      expect(state.isDirty).toBe(true)
      invoke(FILE_CHANNELS.setDirty, 'yes')
      expect(state.isDirty).toBe(false)
    })
  })

  describe(FILE_CHANNELS.confirmDiscard, () => {
    it('resolves true when the user discards', async () => {
      showMessageBox.mockResolvedValue({ response: 0 })
      await expect(invoke(FILE_CHANNELS.confirmDiscard)).resolves.toEqual({
        success: true,
        data: true,
      })
    })

    it('resolves false when the user cancels', async () => {
      showMessageBox.mockResolvedValue({ response: 1 })
      await expect(invoke(FILE_CHANNELS.confirmDiscard)).resolves.toEqual({
        success: true,
        data: false,
      })
    })

    it('wraps dialog failures as an error string', async () => {
      showMessageBox.mockRejectedValue('boom')
      await expect(invoke(FILE_CHANNELS.confirmDiscard)).resolves.toEqual({
        success: false,
        error: 'boom',
      })
    })
  })
})

describe('confirmDiscard', () => {
  it('passes the owning window to the message box', async () => {
    showMessageBox.mockResolvedValue({ response: 0 })
    await expect(confirmDiscard(window)).resolves.toBe(true)
    expect(showMessageBox).toHaveBeenCalledWith(
      window,
      expect.objectContaining({ type: 'warning' })
    )
  })
})

// Last in the file: re-registers the channels with the real-fs default io.
describe('registerFileHandlers with default io', () => {
  it('falls back to the real fs bindings', () => {
    expect(registerFileHandlers(() => window)).toEqual({ isDirty: false })
  })
})
