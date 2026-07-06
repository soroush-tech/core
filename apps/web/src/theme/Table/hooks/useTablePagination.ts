import { useCallback, useState } from 'react'

export interface UseTablePaginationOptions {
  /** Initial zero-based page. Default: `0`. */
  defaultPage?: number
  /** Initial rows per page; `-1` shows all rows. Default: `10`. */
  defaultRowsPerPage?: number
}

/** Paging state — property names mirror `TablePagination`'s props so it spreads in one go. */
export interface TablePaginationState {
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  /** Changing the page size resets to the first page. */
  onRowsPerPageChange: (rowsPerPage: number) => void
}

/**
 * Pagination state for tables.
 *
 * ```tsx
 * const pagination = useTablePagination({ defaultRowsPerPage: 10 })
 * <TablePagination count={data.length} {...pagination} />
 * <TableControl data={data} pagination={pagination}>{(row) => …}</TableControl>
 * ```
 */
export function useTablePagination({
  defaultPage = 0,
  defaultRowsPerPage = 10,
}: UseTablePaginationOptions = {}): TablePaginationState {
  const [page, setPage] = useState(defaultPage)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)

  const onPageChange = useCallback((nextPage: number) => setPage(nextPage), [])
  const onRowsPerPageChange = useCallback((nextRowsPerPage: number) => {
    setRowsPerPage(nextRowsPerPage)
    setPage(0)
  }, [])

  return { page, rowsPerPage, onPageChange, onRowsPerPageChange }
}
