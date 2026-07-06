import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTableSelection } from './useTableSelection'

const keys = ['web', 'api', 'worker'] as const

describe('useTableSelection', () => {
  it('starts with nothing selected', () => {
    const { result } = renderHook(() => useTableSelection(keys))
    expect(result.current.selected).toEqual([])
    expect(result.current.isSelected('web')).toBe(false)
    expect(result.current.all).toMatchObject({ checked: false, indeterminate: false })
  })

  it('toggles a row key on and off', () => {
    const { result } = renderHook(() => useTableSelection(keys))
    act(() => result.current.row('api').onChange())
    expect(result.current.selected).toEqual(['api'])
    expect(result.current.isSelected('api')).toBe(true)
    expect(result.current.row('api').checked).toBe(true)

    act(() => result.current.row('api').onChange())
    expect(result.current.selected).toEqual([])
  })

  it('reports indeterminate when some but not all keys are selected', () => {
    const { result } = renderHook(() => useTableSelection(keys))
    act(() => result.current.row('web').onChange())
    expect(result.current.all).toMatchObject({ checked: false, indeterminate: true })

    act(() => result.current.row('api').onChange())
    act(() => result.current.row('worker').onChange())
    expect(result.current.all).toMatchObject({ checked: true, indeterminate: false })
  })

  it('select-all selects every key, and clicking again clears', () => {
    const { result } = renderHook(() => useTableSelection(keys))
    act(() => result.current.all.onChange())
    expect(result.current.selected).toEqual(['web', 'api', 'worker'])
    expect(result.current.all.checked).toBe(true)

    act(() => result.current.all.onChange())
    expect(result.current.selected).toEqual([])
  })

  it('clear empties the selection', () => {
    const { result } = renderHook(() => useTableSelection(keys))
    act(() => result.current.all.onChange())
    act(() => result.current.clear())
    expect(result.current.selected).toEqual([])
  })

  it('never reports all-selected for an empty key list', () => {
    const { result } = renderHook(() => useTableSelection([]))
    expect(result.current.all).toMatchObject({ checked: false, indeterminate: false })
  })

  it('fires onChange with the next selection on every mutation', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useTableSelection(keys, onChange))
    act(() => result.current.row('web').onChange())
    expect(onChange).toHaveBeenLastCalledWith(['web'])
    act(() => result.current.all.onChange())
    expect(onChange).toHaveBeenLastCalledWith(['web', 'api', 'worker'])
    act(() => result.current.all.onChange())
    expect(onChange).toHaveBeenLastCalledWith([])
    act(() => result.current.row('api').onChange())
    act(() => result.current.clear())
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('keeps the selection when the keys are reordered (identity, not index)', () => {
    const { result, rerender } = renderHook(({ list }) => useTableSelection(list), {
      initialProps: { list: ['web', 'api', 'worker'] },
    })
    act(() => result.current.row('api').onChange())
    rerender({ list: ['worker', 'api', 'web'] })
    expect(result.current.isSelected('api')).toBe(true)
    expect(result.current.all).toMatchObject({ checked: false, indeterminate: true })
  })

  it('ignores selected keys that are no longer present when computing the header state', () => {
    const { result, rerender } = renderHook(({ list }) => useTableSelection(list), {
      initialProps: { list: ['web', 'api'] },
    })
    act(() => result.current.all.onChange())
    rerender({ list: ['web'] })
    // 'api' is still in `selected` but every present key is selected → checked
    expect(result.current.all).toMatchObject({ checked: true, indeterminate: false })
  })
})
