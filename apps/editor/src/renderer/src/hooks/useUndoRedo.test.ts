import { act, renderHook } from '@testing-library/react'
import { useUndoRedo } from './useUndoRedo'

const COMMIT_DELAY_MS = 500

describe('useUndoRedo', () => {
  const onChange = vi.fn()

  const renderUndoRedo = (initial = '') =>
    renderHook(({ value }) => useUndoRedo(value, onChange), {
      initialProps: { value: initial },
    })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with nothing to undo or redo', () => {
    const { result } = renderUndoRedo()
    expect(result.current).toMatchObject({ canUndo: false, canRedo: false })
    act(() => result.current.undo())
    act(() => result.current.redo())
    expect(onChange).not.toHaveBeenCalled()
  })

  it('coalesces rapid edits into a single undo step', () => {
    const { result, rerender } = renderUndoRedo()
    rerender({ value: 'a' })
    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(COMMIT_DELAY_MS))
    expect(result.current.canUndo).toBe(true)

    act(() => result.current.undo())
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('separates edits committed after the delay into distinct steps', () => {
    const { result, rerender } = renderUndoRedo()
    rerender({ value: 'a' })
    act(() => vi.advanceTimersByTime(COMMIT_DELAY_MS))
    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(COMMIT_DELAY_MS))

    act(() => result.current.undo())
    expect(onChange).toHaveBeenLastCalledWith('a')
    rerender({ value: 'a' })
    act(() => result.current.undo())
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('redoes an undone step', () => {
    const { result, rerender } = renderUndoRedo()
    rerender({ value: 'a' })
    act(() => vi.advanceTimersByTime(COMMIT_DELAY_MS))
    act(() => result.current.undo())
    rerender({ value: '' })
    expect(result.current.canRedo).toBe(true)

    act(() => result.current.redo())
    expect(onChange).toHaveBeenLastCalledWith('a')
  })

  it('flushes a still-pending edit when undo is invoked early', () => {
    const { result, rerender } = renderUndoRedo()
    rerender({ value: 'a' })
    act(() => result.current.undo())
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('drops the redo stack when a new edit lands', () => {
    const { result, rerender } = renderUndoRedo()
    rerender({ value: 'a' })
    act(() => vi.advanceTimersByTime(COMMIT_DELAY_MS))
    act(() => result.current.undo())
    rerender({ value: '' })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(COMMIT_DELAY_MS))
    expect(result.current.canRedo).toBe(false)

    act(() => result.current.redo())
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('reset clears both stacks', () => {
    const { result, rerender } = renderUndoRedo()
    rerender({ value: 'a' })
    act(() => vi.advanceTimersByTime(COMMIT_DELAY_MS))
    act(() => result.current.reset())
    expect(result.current).toMatchObject({ canUndo: false, canRedo: false })
  })

  it('binds Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y and ignores other keys', () => {
    const { rerender } = renderUndoRedo()
    rerender({ value: 'a' })
    act(() => vi.advanceTimersByTime(COMMIT_DELAY_MS))

    const press = (key: string, init: KeyboardEventInit = {}) =>
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key, ctrlKey: true, ...init }))
      })

    press('s')
    press('z', { ctrlKey: false })
    expect(onChange).not.toHaveBeenCalled()

    press('z')
    expect(onChange).toHaveBeenLastCalledWith('')
    rerender({ value: '' })

    press('z', { shiftKey: true })
    expect(onChange).toHaveBeenLastCalledWith('a')
    rerender({ value: 'a' })

    press('z')
    rerender({ value: '' })
    press('y')
    expect(onChange).toHaveBeenLastCalledWith('a')
  })
})
