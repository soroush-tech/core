import { act, renderHook, waitFor } from '@testing-library/react'
import { useDocument } from './useDocument'

const fileApi = {
  open: vi.fn(),
  save: vi.fn(),
  setDirty: vi.fn().mockResolvedValue({ success: true, data: null }),
  confirmDiscard: vi.fn(),
}

const gistsApi = { stage: vi.fn() }

vi.stubGlobal('editorAPI', { file: fileApi, gists: gistsApi })

beforeEach(() => {
  vi.clearAllMocks()
  fileApi.setDirty.mockResolvedValue({ success: true, data: null })
  gistsApi.stage.mockResolvedValue({ success: true, data: {} })
})

describe('useDocument', () => {
  it('starts with an empty, clean document and mirrors dirty state to main', async () => {
    const { result } = renderHook(() => useDocument())
    expect(result.current).toMatchObject({ content: '', filePath: null, isDirty: false })
    await waitFor(() => expect(fileApi.setDirty).toHaveBeenCalledWith(false, false))
  })

  it('marks the document dirty on change', async () => {
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('# hello'))
    expect(result.current).toMatchObject({ content: '# hello', isDirty: true })
    await waitFor(() => expect(fileApi.setDirty).toHaveBeenCalledWith(true, false))
  })

  it('resets on newDocument without prompting when clean', async () => {
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.newDocument())
    expect(fileApi.confirmDiscard).not.toHaveBeenCalled()
    expect(result.current.content).toBe('')
  })

  it('keeps the document when the offered save cannot be completed', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: 'save' })
    fileApi.save.mockResolvedValue({ success: true, data: null })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('draft'))
    await act(() => result.current.newDocument())
    expect(result.current.content).toBe('draft')
  })

  it('discards a dirty document when confirmed', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: 'discard' })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('draft'))
    await act(() => result.current.newDocument())
    expect(result.current).toMatchObject({ content: '', isDirty: false })
  })

  it('saves first when the prompt offers it, then replaces the document', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: 'save' })
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\draft.md' } })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('draft'))

    await act(() => result.current.newDocument())

    expect(fileApi.save).toHaveBeenCalledWith(null, 'draft')
    expect(result.current).toMatchObject({ content: '', isDirty: false })
  })

  it('keeps the document when the offered save does not happen', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: 'save' })
    // A cancelled Save As dialog: nothing was written, so nothing may be lost.
    fileApi.save.mockResolvedValue({ success: true, data: null })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('draft'))

    await act(() => result.current.newDocument())

    expect(result.current).toMatchObject({ content: 'draft', isDirty: true })
  })

  it('keeps the document when the prompt itself fails', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: false, error: 'no window' })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('draft'))

    await act(() => result.current.newDocument())
    expect(result.current.content).toBe('draft')
  })

  it('stages a gist-backed document instead of writing it to disk', async () => {
    gistsApi.stage.mockResolvedValue({ success: true, data: {} })
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.load('# notes', { gistId: 'abc123', filename: 'notes.md' }))
    act(() => result.current.change('# edited'))

    await act(() => result.current.save())

    expect(gistsApi.stage).toHaveBeenCalledWith('abc123', 'notes.md', {
      status: 'modified',
      content: '# edited',
    })
    expect(fileApi.save).not.toHaveBeenCalled()
    expect(result.current.isDirty).toBe(false)
  })

  it.each([
    ['staged into the sandbox', { gistId: 'abc123', filename: 'notes.md' }, () => gistsApi.stage],
    ['written to disk', null, () => fileApi.save],
  ])('stays dirty when more was typed while it was being %s', async (_name, origin, api) => {
    let release!: (value: unknown) => void
    api().mockReturnValue(new Promise((resolve) => (release = resolve)))
    fileApi.save.mockReturnValue(new Promise((resolve) => (release = resolve)))
    if (origin) gistsApi.stage.mockReturnValue(new Promise((resolve) => (release = resolve)))

    const { result } = renderHook(() => useDocument())
    if (origin) await act(() => result.current.load('# notes', origin))
    act(() => result.current.change('# first'))

    let pending!: Promise<boolean>
    act(() => {
      pending = result.current.save()
    })
    // Typed after the save took its copy of the content.
    act(() => result.current.change('# second'))

    await act(async () => {
      release(
        origin ? { success: true, data: {} } : { success: true, data: { filePath: 'C:\\notes.md' } }
      )
      await pending
    })

    // What reached disk is not what is in the editor, so there is still work to save.
    expect(result.current.isDirty).toBe(true)
  })

  it('keeps a gist-backed document dirty when staging fails', async () => {
    gistsApi.stage.mockResolvedValue({ success: false, error: 'EACCES' })
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.load('# notes', { gistId: 'abc123', filename: 'notes.md' }))
    act(() => result.current.change('# edited'))

    await act(() => result.current.save())

    expect(result.current).toMatchObject({ isDirty: true, error: 'EACCES' })
  })

  it('writes a gist-backed document to disk on Save As', async () => {
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\notes.md' } })
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.load('# notes', { gistId: 'abc123', filename: 'notes.md' }))

    await act(() => result.current.save(true))

    expect(fileApi.save).toHaveBeenCalledWith(null, '# notes')
    expect(gistsApi.stage).not.toHaveBeenCalled()
    // It now belongs to that file, not to the gist.
    expect(result.current).toMatchObject({ filePath: 'C:\\notes.md', origin: null })
  })

  it('opens a file and replaces the document', async () => {
    fileApi.open.mockResolvedValue({
      success: true,
      data: { filePath: 'C:\\notes.md', content: '# notes' },
    })
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.open())
    expect(result.current).toMatchObject({
      content: '# notes',
      filePath: 'C:\\notes.md',
      isDirty: false,
    })
  })

  it('counts the documents that replace one another, but not edits or saves', async () => {
    fileApi.open.mockResolvedValue({
      success: true,
      data: { filePath: 'C:\\notes.md', content: '# notes' },
    })
    const { result } = renderHook(() => useDocument())
    expect(result.current.revision.current).toBe(0)

    await act(() => result.current.newDocument())
    await act(() => result.current.open())
    await act(() => result.current.load('# notes', { gistId: 'abc123', filename: 'notes.md' }))
    expect(result.current.revision.current).toBe(3)

    // Editing and saving stay on the same document, so work started against it
    // is still about this one.
    act(() => result.current.change('typed'))
    await act(() => result.current.save())
    expect(result.current.revision.current).toBe(3)
  })

  it('does not hand a finished save to the document that replaced it', async () => {
    let written!: (result: unknown) => void
    fileApi.save.mockReturnValue(new Promise((resolve) => (written = resolve)))
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: 'discard' })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('draft'))

    const saving = result.current.save()
    // A gist file takes the document over while the write is still running.
    await act(() => result.current.load('# notes', { gistId: 'abc123', filename: 'notes.md' }))
    await act(async () => written({ success: true, data: { filePath: 'C:\\notes.md' } }))

    // Binding the gist file to that path would send the next save to disk and
    // leave nothing to publish.
    await expect(saving).resolves.toBe(false)
    expect(result.current).toMatchObject({
      filePath: null,
      origin: { gistId: 'abc123', filename: 'notes.md' },
      isDirty: false,
    })
  })

  it('does not hand a finished stage to the document that replaced it', async () => {
    let staged!: (result: unknown) => void
    gistsApi.stage.mockReturnValue(new Promise((resolve) => (staged = resolve)))
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.load('# notes', { gistId: 'abc123', filename: 'notes.md' }))
    act(() => result.current.change('# edited'))

    const saving = result.current.save()
    fileApi.open.mockResolvedValue({
      success: true,
      data: { filePath: 'C:\\other.md', content: '# other' },
    })
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: 'discard' })
    await act(() => result.current.open())
    await act(async () => staged({ success: false, error: 'GitHub responded 404' }))

    // The failure belongs to a document that is gone; the opened file is not
    // the one to report it against.
    await expect(saving).resolves.toBe(false)
    expect(result.current).toMatchObject({ filePath: 'C:\\other.md', error: null })
  })

  it('leaves the document untouched when the open dialog is cancelled', async () => {
    fileApi.open.mockResolvedValue({ success: true, data: null })
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.open())
    expect(result.current.content).toBe('')
  })

  it('surfaces open failures via error and clears it on the next change', async () => {
    fileApi.open.mockResolvedValue({ success: false, error: 'EACCES' })
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.open())
    expect(result.current.error).toBe('EACCES')
    act(() => result.current.change('typed'))
    expect(result.current.error).toBeNull()
  })

  it('does not open over unsaved changes the user could not keep', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: false, error: 'no window' })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('draft'))
    await act(() => result.current.open())
    expect(fileApi.open).not.toHaveBeenCalled()
  })

  it('saves to the current path and clears the dirty flag', async () => {
    fileApi.open.mockResolvedValue({
      success: true,
      data: { filePath: 'C:\\notes.md', content: '# notes' },
    })
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\notes.md' } })
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.open())
    act(() => result.current.change('# edited'))
    await act(() => result.current.save())
    expect(fileApi.save).toHaveBeenCalledWith('C:\\notes.md', '# edited')
    expect(result.current.isDirty).toBe(false)
  })

  it('forces the dialog for Save As and adopts the chosen path', async () => {
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\new.md' } })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('body'))
    await act(() => result.current.save(true))
    expect(fileApi.save).toHaveBeenCalledWith(null, 'body')
    expect(result.current.filePath).toBe('C:\\new.md')
  })

  it('stays dirty when the save dialog is cancelled', async () => {
    fileApi.save.mockResolvedValue({ success: true, data: null })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('body'))
    await act(() => result.current.save(true))
    expect(result.current.isDirty).toBe(true)
  })

  it('surfaces save failures via error', async () => {
    fileApi.save.mockResolvedValue({ success: false, error: 'ENOSPC' })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('body'))
    await act(() => result.current.save())
    expect(result.current.error).toBe('ENOSPC')
    expect(result.current.isDirty).toBe(true)
  })
})
