import { type ElementType, type ReactNode } from 'react'
import { NativeSelect, type NativeSelectOption } from '../../NativeSelect'
import { Typography } from '../../Typography'
import { TableCell, type TableCellProps } from '../TableCell'
import { TablePaginationActions, type TablePaginationActionType } from '../TablePaginationActions'
import { styled } from '../../index'

export interface TablePaginationDisplayedRowsInfo {
  from: number
  to: number
  count: number
  page: number
}

export interface TablePaginationProps extends Omit<
  TableCellProps,
  'children' | 'variant' | 'align' | 'sortDirection'
> {
  /** Total number of rows; `-1` = unknown (server-side pagination). */
  count: number
  /** Zero-based current page. */
  page: number
  /** Rows per page; `-1` shows all rows. */
  rowsPerPage: number
  /** Fired with the target zero-based page. */
  onPageChange: (page: number) => void
  /** Fired with the new rows-per-page value. */
  onRowsPerPageChange?: (rowsPerPage: number) => void
  /** Options for the rows-per-page selector. Fewer than two options hides it. */
  rowsPerPageOptions?: Array<number | { label: string; value: number }>
  /** Disables all controls. Default: `false`. */
  disabled?: boolean
  shouldShowFirstButton?: boolean
  shouldShowLastButton?: boolean
  /** Label for the rows-per-page selector. Default: `'Rows per page:'`. */
  rowsPerPageLabel?: ReactNode
  /** Renders the displayed-rows range. A sensible default (`1–10 of 57`) is provided. */
  displayedRowsLabel?: (info: TablePaginationDisplayedRowsInfo) => ReactNode
  /** Accessible name per nav button. A sensible default is provided. */
  getItemAriaLabel?: (type: TablePaginationActionType) => string
  as?: ElementType
}

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

const defaultDisplayedRowsLabel = ({ from, to, count }: TablePaginationDisplayedRowsInfo) => {
  const countLabel = count !== -1 ? count : `more than ${to}`
  return `${from}–${to} of ${countLabel}`
}

const defaultGetItemAriaLabel = (type: TablePaginationActionType) => `Go to ${type} page`

const Toolbar = styled('div', { label: 'TablePaginationToolbar' })({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: '1rem',
})

/**
 * A `TableCell`-based pagination control for `TableFooter > TableRow`.
 * Controlled only — the consumer owns `page` and `rowsPerPage`.
 */
export function TablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
  disabled = false,
  shouldShowFirstButton = false,
  shouldShowLastButton = false,
  rowsPerPageLabel = 'Rows per page:',
  displayedRowsLabel = defaultDisplayedRowsLabel,
  getItemAriaLabel = defaultGetItemAriaLabel,
  colSpan = 1000,
  as,
  ...rest
}: Readonly<TablePaginationProps>) {
  const selectOptions: NativeSelectOption[] = rowsPerPageOptions.map((option) =>
    typeof option === 'number' ? { label: String(option), value: option } : option
  )
  // Fewer than two options makes the selector pointless — hide it entirely.
  const hasRowsPerPageSelector = selectOptions.length >= 2

  const from = count === 0 ? 0 : page * rowsPerPage + 1
  const boundedTo =
    count === -1 ? (page + 1) * rowsPerPage : Math.min(count, (page + 1) * rowsPerPage)
  const to = rowsPerPage === -1 ? count : boundedTo

  return (
    <TableCell variant="footer" as={as} colSpan={colSpan} {...rest}>
      <Toolbar>
        {hasRowsPerPageSelector && (
          <Typography variant="caption" color="secondary" as="span">
            {rowsPerPageLabel}
          </Typography>
        )}
        {hasRowsPerPageSelector && (
          <NativeSelect
            variant="text"
            size="sm"
            options={selectOptions}
            value={rowsPerPage}
            disabled={disabled}
            onChange={(value) => onRowsPerPageChange?.(Number(value))}
            selectProps={{ 'aria-label': 'Rows per page' }}
          />
        )}
        <Typography variant="caption" color="secondary" as="span">
          {displayedRowsLabel({ from, to, count, page })}
        </Typography>
        <TablePaginationActions
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          getItemAriaLabel={getItemAriaLabel}
          disabled={disabled}
          shouldShowFirstButton={shouldShowFirstButton}
          shouldShowLastButton={shouldShowLastButton}
        />
      </Toolbar>
    </TableCell>
  )
}
