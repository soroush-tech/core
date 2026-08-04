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

    it('writes straight back to a path the user opened', async () => {
      showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['C:\\notes.md'] })
      readFile.mockResolvedValue('# hi')
      await invoke(FILE_CHANNELS.open)

      writeFile.mockResolvedValue(undefined)
      await expect(invoke(FILE_CHANNELS.save, 'C:\\notes.md', 'body')).resolves.toEqual({
        success: true,
        data: { filePath: 'C:\\notes.md' },
      })
      expect(writeFile).toHaveBeenCalledWith('C:\\notes.md', 'body', 'utf8')
      expect(showSaveDialog).not.toHaveBeenCalled()
    })

    it('refuses a path the user never chose, so the renderer cannot name one', async () => {
      await expect(
        invoke(FILE_CHANNELS.save, 'C:\\Windows\\System32\\drivers\\etc\\hosts', 'x')
      ).resolves.toEqual({
        success: false,
        error: 'Save that file through the Save As dialog first',
      })
      expect(writeFile).not.toHaveBeenCalled()
    })

    it('writes again to a path the save dialog chose earlier', async () => {
      showSaveDialog.mockResolvedValue({ canceled: false, filePath: 'C:\\new.md' })
      writeFile.mockResolvedValue(undefined)
      await invoke(FILE_CHANNELS.save, null, 'first')

      await expect(invoke(FILE_CHANNELS.save, 'C:\\new.md', 'second')).resolves.toEqual({
        success: true,
        data: { filePath: 'C:\\new.md' },
      })
      expect(writeFile).toHaveBeenLastCalledWith('C:\\new.md', 'second', 'utf8')
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
    it.each([
      [0, 'save'],
      [1, 'discard'],
    ])('resolves the choice behind button %i', async (response, choice) => {
      showMessageBox.mockResolvedValue({ response })
      await expect(invoke(FILE_CHANNELS.confirmDiscard)).resolves.toEqual({
        success: true,
        data: choice,
      })
    })

    it('labels the prompt from the dirty state the renderer last mirrored', async () => {
      showMessageBox.mockResolvedValue({ response: 1 })

      await invoke(FILE_CHANNELS.setDirty, true, true)
      await invoke(FILE_CHANNELS.confirmDiscard)

      expect(showMessageBox).toHaveBeenCalledWith(
        window,
        expect.objectContaining({ buttons: ['Save as draft', 'Discard changes'] })
      )
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
  it.each([
    [0, 'save'],
    [1, 'discard'],
  ])('maps button %i to %s', async (response, choice) => {
    showMessageBox.mockResolvedValue({ response })
    await expect(confirmDiscard(window, false)).resolves.toBe(choice)
  })

  it('names keeping a gist file what it is — a draft', async () => {
    showMessageBox.mockResolvedValue({ response: 0 })
    await confirmDiscard(window, true)

    expect(showMessageBox).toHaveBeenCalledWith(
      window,
      expect.objectContaining({
        type: 'warning',
        buttons: ['Save as draft', 'Discard changes'],
        defaultId: 0,
        // Escape keeps the work: dismissing the prompt must never lose it.
        cancelId: 0,
      })
    )
  })

  it('offers a plain Save for a document that is not from a gist', async () => {
    showMessageBox.mockResolvedValue({ response: 0 })
    await confirmDiscard(window, false)

    expect(showMessageBox).toHaveBeenCalledWith(
      window,
      expect.objectContaining({ buttons: ['Save', 'Discard changes'] })
    )
  })

  it.each([[-1], [99]])('keeps the work for an unrecognised reply (%i)', async (response) => {
    showMessageBox.mockResolvedValue({ response })
    await expect(confirmDiscard(window, true)).resolves.toBe('save')
  })
})

// Last in the file: re-registers the channels with the real-fs default io.
describe('registerFileHandlers with default io', () => {
  it('falls back to the real fs bindings', () => {
    expect(registerFileHandlers(() => window)).toEqual({ isDirty: false, isDraft: false })
  })
})
