import { type HTMLAttributes } from 'react'
import { PaginationItem, type PaginationItemSize } from '../../Pagination/PaginationItem'
import { styled, useTheme } from '../../index'
import { themeDefault } from '../../utils/themeDefault'

export type TablePaginationActionType = 'first' | 'previous' | 'next' | 'last'

export interface TablePaginationActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Total number of rows; `-1` = unknown (server-side pagination). */
  count: number
  /** Zero-based current page. */
  page: number
  /** Rows per page; `-1` = all rows. */
  rowsPerPage: number
  /** Fired with the target zero-based page. */
  onPageChange: (page: number) => void
  /** Accessible name per nav button — important for screen readers. */
  getItemAriaLabel: (type: TablePaginationActionType) => string
  /** Disables all buttons. Default: `false`. */
  disabled?: boolean
  shouldShowFirstButton?: boolean
  shouldShowLastButton?: boolean
  /** Button density — resolves against `theme.sizes`. Default: `'sm'`. */
  size?: PaginationItemSize
}

const ActionsRoot = styled('div', {
  name: 'TablePaginationActions',
  label: 'TablePaginationActions',
})({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  flexShrink: 0,
})

/**
 * The first / previous / next / last button cluster inside `TablePagination`.
 * Composes `PaginationItem`'s nav types; boundary state is derived from
 * `count` / `page` / `rowsPerPage`.
 */
export function TablePaginationActions({
  count,
  page,
  rowsPerPage,
  onPageChange,
  getItemAriaLabel,
  disabled = false,
  shouldShowFirstButton = false,
  shouldShowLastButton = false,
  size: sizeProp,
  ...rest
}: Readonly<TablePaginationActionsProps>) {
  const theme = useTheme()
  const size = sizeProp ?? themeDefault(theme, 'compactSize', 'sm')
  // rowsPerPage -1 shows every row on one page; count -1 means the last page is unknown.
  const lastPage = rowsPerPage === -1 ? 0 : Math.max(0, Math.ceil(count / rowsPerPage) - 1)
  const isBackwardDisabled = disabled || page <= 0
  const isNextDisabled = disabled || (count !== -1 && page >= lastPage)
  const isLastDisabled = disabled || count === -1 || page >= lastPage

  return (
    <ActionsRoot {...rest}>
      {shouldShowFirstButton && (
        <PaginationItem
          type="first"
          size={size}
          disabled={isBackwardDisabled}
          onClick={() => onPageChange(0)}
          aria-label={getItemAriaLabel('first')}
        />
      )}
      <PaginationItem
        type="previous"
        size={size}
        disabled={isBackwardDisabled}
        onClick={() => onPageChange(page - 1)}
        aria-label={getItemAriaLabel('previous')}
      />
      <PaginationItem
        type="next"
        size={size}
        disabled={isNextDisabled}
        onClick={() => onPageChange(page + 1)}
        aria-label={getItemAriaLabel('next')}
      />
      {shouldShowLastButton && (
        <PaginationItem
          type="last"
          size={size}
          disabled={isLastDisabled}
          onClick={() => onPageChange(lastPage)}
          aria-label={getItemAriaLabel('last')}
        />
      )}
    </ActionsRoot>
  )
}
