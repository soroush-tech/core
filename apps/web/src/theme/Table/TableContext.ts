import { createContext } from 'react'
import { type Theme } from '@emotion/react'

/** Cell padding modes broadcast from `Table` to descendant cells. */
export type TableCellPadding = 'normal' | 'none'

/** Table-wide cell config, provided by `Table` and consumed by `TableCell` / `TableSortLabel`. */
export interface TableContextValue {
  size?: keyof Theme['sizes']
  cellPadding?: TableCellPadding
  hasStickyHeader?: boolean
  /** Hides inactive sort icons (revealed on hover/focus). */
  shouldHideSortIcon?: boolean
  /** Truncates overflowing cell text with an ellipsis. */
  hasEllipsis?: boolean
}

export const TableContext = createContext<TableContextValue>({})
