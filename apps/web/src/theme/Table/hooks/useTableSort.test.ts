import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTableSort } from './useTableSort'

describe('useTableSort', () => {
  it('starts with every column inactive at asc', () => {
    const { result } = renderHook(() => useTableSort(['name', 'age']))
    expect(result.current.name).toMatchObject({ isActive: false, direction: 'asc' })
    expect(result.current.age).toMatchObject({ isActive: false, direction: 'asc' })
  })

  it('activates a column and flips its direction on click — first click sorts desc', () => {
    const { result } = renderHook(() => useTableSort(['name', 'age']))
    act(() => result.current.name.onClick())
    expect(result.current.name).toMatchObject({ isActive: true, direction: 'desc' })
    expect(result.current.age).toMatchObject({ isActive: false, direction: 'asc' })

    act(() => result.current.name.onClick())
    expect(result.current.name).toMatchObject({ isActive: true, direction: 'asc' })
  })

  it('remembers each column direction across column switches', () => {
    const { result } = renderHook(() => useTableSort(['name', 'age']))
    act(() => result.current.name.onClick()) // name → desc
    act(() => result.current.age.onClick()) // age → desc, name inactive
    expect(result.current.age).toMatchObject({ isActive: true, direction: 'desc' })
    expect(result.current.name).toMatchObject({ isActive: false, direction: 'desc' })

    act(() => result.current.name.onClick()) // name flips its remembered desc → asc
    expect(result.current.name).toMatchObject({ isActive: true, direction: 'asc' })
  })

  it('fires onChange with the column key and new direction', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useTableSort(['name'], onChange))
    act(() => result.current.name.onClick())
    expect(onChange).toHaveBeenCalledWith('name', 'desc')
    act(() => result.current.name.onClick())
    expect(onChange).toHaveBeenCalledWith('name', 'asc')
  })

  it('exposes entries whose shape spreads onto TableSortLabel', () => {
    const { result } = renderHook(() => useTableSort(['name']))
    expect(Object.keys(result.current.name).sort()).toEqual(['direction', 'isActive', 'onClick'])
  })

  it('keeps stable entry identities across unrelated re-renders', () => {
    const { result, rerender } = renderHook(() => useTableSort(['name']))
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})
