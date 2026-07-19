import { act, renderHook, waitFor } from '@testing-library/react'
import { useDocument } from './useDocument'

const fileApi = {
  open: vi.fn(),
  save: vi.fn(),
  setDirty: vi.fn().mockResolvedValue({ success: true, data: null }),
  confirmDiscard: vi.fn(),
}

vi.stubGlobal('editorAPI', { file: fileApi })

beforeEach(() => {
  vi.clearAllMocks()
  fileApi.setDirty.mockResolvedValue({ success: true, data: null })
})

describe('useDocument', () => {
  it('starts with an empty, clean document and mirrors dirty state to main', async () => {
    const { result } = renderHook(() => useDocument())
    expect(result.current).toMatchObject({ content: '', filePath: null, isDirty: false })
    await waitFor(() => expect(fileApi.setDirty).toHaveBeenCalledWith(false))
  })

  it('marks the document dirty on change', async () => {
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('# hello'))
    expect(result.current).toMatchObject({ content: '# hello', isDirty: true })
    await waitFor(() => expect(fileApi.setDirty).toHaveBeenCalledWith(true))
  })

  it('resets on newDocument without prompting when clean', async () => {
    const { result } = renderHook(() => useDocument())
    await act(() => result.current.newDocument())
    expect(fileApi.confirmDiscard).not.toHaveBeenCalled()
    expect(result.current.content).toBe('')
  })

  it('keeps the document when a dirty newDocument is not confirmed', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: false })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('draft'))
    await act(() => result.current.newDocument())
    expect(result.current.content).toBe('draft')
  })

  it('discards a dirty document when confirmed', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: true })
    const { result } = renderHook(() => useDocument())
    act(() => result.current.change('draft'))
    await act(() => result.current.newDocument())
    expect(result.current).toMatchObject({ content: '', isDirty: false })
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

  it('does not open over unsaved changes when the prompt is declined', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: false })
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
