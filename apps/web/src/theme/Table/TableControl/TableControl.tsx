import { useMemo, type ReactNode } from 'react'
import { type TableSortEntry, type TableSortMap } from 'src/theme/Table/hooks/useTableSort'
import { type TablePaginationState } from 'src/theme/Table/hooks/useTablePagination'

export interface TableControlProps<T, K extends string = string> {
  /** The full dataset — `TableControl` derives the visible rows from it. */
  data: readonly T[]
  /** Sort map from `useTableSort` — the active entry drives the ordering. */
  sort?: TableSortMap<K>
  /** Paging state from `useTablePagination` — drives the visible slice. */
  pagination?: Pick<TablePaginationState, 'page' | 'rowsPerPage'>
  /**
   * Custom sort — overrides the default string/number comparison. Receives the
   * active column key, so different columns can use different logic:
   * `(a, b, orderBy) => orderBy === 'name' ? a.name.localeCompare(b.name) : a[orderBy] - b[orderBy]`
   */
  sortFunction?: (a: T, b: T, orderBy: K) => number
  /** Row renderer — invoked for each visible row. */
  children: (row: T, index: number) => ReactNode
}

// Ascending comparison; TableControl flips the sign for 'desc'.
const defaultSortFunction = <T,>(a: T, b: T, orderBy: string): number => {
  const first = (a as Record<string, unknown>)[orderBy] as string | number
  const second = (b as Record<string, unknown>)[orderBy] as string | number
  if (first < second) return -1
  if (first > second) return 1
  return 0
}

/**
 * Renders the visible rows of a dataset inside `TableBody` — sorted by the
 * active `useTableSort` column and sliced by the `useTablePagination` state.
 * Emits the rows directly (no wrapper element), so its output are valid
 * `<tr>` children of `<tbody>`. Both `sort` and `pagination` are optional.
 */
export function TableControl<T, K extends string = string>({
  data,
  sort,
  pagination,
  sortFunction = defaultSortFunction,
  children,
}: Readonly<TableControlProps<T, K>>) {
  const rows = useMemo(() => {
    let visible = [...data]

    const active =
      sort && (Object.entries(sort) as [K, TableSortEntry][]).find(([, entry]) => entry.isActive)
    if (active) {
      const [orderBy, { direction }] = active
      const sign = direction === 'asc' ? 1 : -1
      visible.sort((a, b) => sign * sortFunction(a, b, orderBy))
    }

    if (pagination && pagination.rowsPerPage !== -1) {
      const { rowsPerPage } = pagination
      // Clamp so a shrinking dataset never strands the view on an empty page.
      const lastPage = Math.max(0, Math.ceil(visible.length / rowsPerPage) - 1)
      const page = Math.min(Math.max(0, pagination.page), lastPage)
      visible = visible.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    }

    return visible
  }, [data, sort, pagination, sortFunction])

  return <>{rows.map(children)}</>
}
