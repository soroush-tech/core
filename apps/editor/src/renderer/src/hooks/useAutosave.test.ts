import { renderHook } from '@testing-library/react'
import { AUTOSAVE_INTERVAL_MS, useAutosave } from './useAutosave'

describe('useAutosave', () => {
  const save = vi.fn(() => Promise.resolve(true))

  beforeEach(() => {
    save.mockClear()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('saves a dirty gist document after the interval', () => {
    renderHook(() => useAutosave(true, true, save))
    vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('keeps saving while the document stays dirty, once per interval', () => {
    renderHook(() => useAutosave(true, true, save))
    vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS * 3)
    expect(save).toHaveBeenCalledTimes(3)
  })

  it('does not save a document without a draft to save into', () => {
    renderHook(() => useAutosave(false, true, save))
    vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS * 2)
    expect(save).not.toHaveBeenCalled()
  })

  it('does not save a clean document', () => {
    renderHook(() => useAutosave(true, false, save))
    vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS * 2)
    expect(save).not.toHaveBeenCalled()
  })

  it('stops once the document comes clean', () => {
    const { rerender } = renderHook(
      ({ isDirty }: { isDirty: boolean }) => useAutosave(true, isDirty, save),
      { initialProps: { isDirty: true } }
    )
    vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS)
    expect(save).toHaveBeenCalledTimes(1)

    rerender({ isDirty: false })
    vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS * 2)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('stops when the editor unmounts', () => {
    const { unmount } = renderHook(() => useAutosave(true, true, save))
    unmount()
    vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS * 2)
    expect(save).not.toHaveBeenCalled()
  })
})
