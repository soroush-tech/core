import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePagination, type UsePaginationItem } from './usePagination'

const shape = (items: UsePaginationItem[]) =>
  items.map((item) => (item.type === 'page' ? item.page : item.type))

describe('usePagination', () => {
  it('renders all pages with prev/next when the count is small', () => {
    const { result } = renderHook(() => usePagination({ count: 3 }))
    expect(shape(result.current.items)).toEqual(['previous', 1, 2, 3, 'next'])
  })

  it('collapses the middle with ellipses on both sides', () => {
    const { result } = renderHook(() => usePagination({ count: 11, defaultPage: 6 }))
    expect(shape(result.current.items)).toEqual([
      'previous',
      1,
      'start-ellipsis',
      5,
      6,
      7,
      'end-ellipsis',
      11,
      'next',
    ])
  })

  it('honours siblingCount', () => {
    const { result } = renderHook(() =>
      usePagination({ count: 11, defaultPage: 6, siblingCount: 0 })
    )
    expect(shape(result.current.items)).toEqual([
      'previous',
      1,
      'start-ellipsis',
      6,
      'end-ellipsis',
      11,
      'next',
    ])
  })

  it('honours boundaryCount', () => {
    const { result } = renderHook(() =>
      usePagination({ count: 11, defaultPage: 6, boundaryCount: 2 })
    )
    expect(shape(result.current.items)).toEqual([
      'previous',
      1,
      2,
      'start-ellipsis',
      5,
      6,
      7,
      'end-ellipsis',
      10,
      11,
      'next',
    ])
  })

  it('shows plain pages instead of ellipses when the range just fits', () => {
    const { result } = renderHook(() => usePagination({ count: 7, defaultPage: 4 }))
    expect(shape(result.current.items)).toEqual(['previous', 1, 2, 3, 4, 5, 6, 7, 'next'])
  })

  it('handles a two-page count without filler pages', () => {
    const { result } = renderHook(() => usePagination({ count: 2 }))
    expect(shape(result.current.items)).toEqual(['previous', 1, 2, 'next'])
  })

  it('renders only disabled nav controls when there are no pages', () => {
    const { result } = renderHook(() => usePagination({ count: 0 }))
    expect(shape(result.current.items)).toEqual(['previous', 'next'])
    expect(result.current.items.every((item) => item.isDisabled)).toBe(true)
  })

  it('adds first/last buttons and removes prev/next via the flags', () => {
    const { result } = renderHook(() =>
      usePagination({
        count: 5,
        shouldShowFirstButton: true,
        shouldShowLastButton: true,
        shouldHidePrevButton: true,
        shouldHideNextButton: true,
      })
    )
    expect(shape(result.current.items)).toEqual(['first', 1, 2, 3, 4, 5, 'last'])
  })

  it('marks the current page as selected', () => {
    const { result } = renderHook(() => usePagination({ count: 5, defaultPage: 3 }))
    const selected = result.current.items.filter((item) => item.isSelected)
    expect(selected).toHaveLength(1)
    expect(selected[0].page).toBe(3)
  })

  it('disables backward nav on the first page and forward nav on the last', () => {
    const { result: first } = renderHook(() =>
      usePagination({
        count: 5,
        defaultPage: 1,
        shouldShowFirstButton: true,
        shouldShowLastButton: true,
      })
    )
    const byType = (items: UsePaginationItem[], type: string) =>
      items.find((item) => item.type === type)
    expect(byType(first.current.items, 'first')?.isDisabled).toBe(true)
    expect(byType(first.current.items, 'previous')?.isDisabled).toBe(true)
    expect(byType(first.current.items, 'next')?.isDisabled).toBe(false)

    const { result: last } = renderHook(() =>
      usePagination({
        count: 5,
        defaultPage: 5,
        shouldShowFirstButton: true,
        shouldShowLastButton: true,
      })
    )
    expect(byType(last.current.items, 'next')?.isDisabled).toBe(true)
    expect(byType(last.current.items, 'last')?.isDisabled).toBe(true)
    expect(byType(last.current.items, 'previous')?.isDisabled).toBe(false)
  })

  it('disables every item when disabled is set', () => {
    const { result } = renderHook(() => usePagination({ count: 5, disabled: true }))
    expect(result.current.items.every((item) => item.isDisabled)).toBe(true)
  })

  it('gives ellipsis items no click handler and a null page', () => {
    const { result } = renderHook(() => usePagination({ count: 11, defaultPage: 6 }))
    const ellipsis = result.current.items.find((item) => item.type === 'start-ellipsis')
    expect(ellipsis?.page).toBeNull()
    expect(ellipsis?.onClick).toBeUndefined()
    expect(ellipsis?.isDisabled).toBe(true)
  })

  it('manages its own page state when uncontrolled', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => usePagination({ count: 5, onChange }))
    act(() => result.current.items.find((item) => item.type === 'next')?.onClick?.())
    expect(onChange).toHaveBeenCalledWith(2)
    expect(result.current.items.find((item) => item.isSelected)?.page).toBe(2)
  })

  it('leaves state to the consumer when controlled', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => usePagination({ count: 5, page: 2, onChange }))
    act(() => result.current.items.find((item) => item.page === 4)?.onClick?.())
    expect(onChange).toHaveBeenCalledWith(4)
    // still page 2 — the consumer owns the state
    expect(result.current.items.find((item) => item.isSelected)?.page).toBe(2)
  })

  it('navigates via first/previous/last targets', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      usePagination({
        count: 9,
        page: 5,
        onChange,
        shouldShowFirstButton: true,
        shouldShowLastButton: true,
      })
    )
    const byType = (type: string) => result.current.items.find((item) => item.type === type)
    act(() => byType('first')?.onClick?.())
    expect(onChange).toHaveBeenLastCalledWith(1)
    act(() => byType('previous')?.onClick?.())
    expect(onChange).toHaveBeenLastCalledWith(4)
    act(() => byType('last')?.onClick?.())
    expect(onChange).toHaveBeenLastCalledWith(9)
  })
})
