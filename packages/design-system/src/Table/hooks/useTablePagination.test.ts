import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTablePagination } from './useTablePagination'

describe('useTablePagination', () => {
  it('defaults to page 0 with 10 rows per page', () => {
    const { result } = renderHook(() => useTablePagination())
    expect(result.current.page).toBe(0)
    expect(result.current.rowsPerPage).toBe(10)
  })

  it('honours defaultPage and defaultRowsPerPage', () => {
    const { result } = renderHook(() =>
      useTablePagination({ defaultPage: 2, defaultRowsPerPage: 25 })
    )
    expect(result.current.page).toBe(2)
    expect(result.current.rowsPerPage).toBe(25)
  })

  it('changes the page via onPageChange', () => {
    const { result } = renderHook(() => useTablePagination())
    act(() => result.current.onPageChange(3))
    expect(result.current.page).toBe(3)
  })

  it('resets to the first page when the page size changes', () => {
    const { result } = renderHook(() => useTablePagination({ defaultPage: 4 }))
    act(() => result.current.onRowsPerPageChange(25))
    expect(result.current.rowsPerPage).toBe(25)
    expect(result.current.page).toBe(0)
  })

  it('mirrors the TablePagination prop names for direct spreading', () => {
    const { result } = renderHook(() => useTablePagination())
    expect(Object.keys(result.current).sort()).toEqual([
      'onPageChange',
      'onRowsPerPageChange',
      'page',
      'rowsPerPage',
    ])
  })
})
