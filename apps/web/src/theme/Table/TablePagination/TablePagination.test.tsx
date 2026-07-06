import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { TablePagination } from './TablePagination'

const renderPagination = (ui: React.ReactElement) =>
  renderWithTheme(
    <table>
      <tfoot>
        <tr>{ui}</tr>
      </tfoot>
    </table>
  )

const defaultProps = {
  count: 100,
  page: 2,
  rowsPerPage: 10,
  onPageChange: () => {},
}

describe('TablePagination', () => {
  it('renders as a footer TableCell spanning the row', () => {
    renderPagination(<TablePagination {...defaultProps} data-testid="pagination" />)
    const cell = screen.getByTestId('pagination')
    expect(cell.tagName).toBe('TD')
    expect(cell).toHaveAttribute('colspan', '1000')
  })

  it('lets as override the root element', () => {
    renderWithTheme(<TablePagination {...defaultProps} as="div" data-testid="pagination" />)
    expect(screen.getByTestId('pagination').tagName).toBe('DIV')
  })

  it('shows the displayed-rows range with the default label', () => {
    renderPagination(<TablePagination {...defaultProps} />)
    expect(screen.getByText('21–30 of 100')).toBeInTheDocument()
  })

  it('labels an unknown count as more-than', () => {
    renderPagination(<TablePagination {...defaultProps} count={-1} />)
    expect(screen.getByText('21–30 of more than 30')).toBeInTheDocument()
  })

  it('shows 0–0 for an empty table and full range for rowsPerPage -1', () => {
    renderPagination(<TablePagination {...defaultProps} count={0} page={0} />)
    expect(screen.getByText('0–0 of 0')).toBeInTheDocument()

    renderPagination(<TablePagination {...defaultProps} page={0} rowsPerPage={-1} count={57} />)
    expect(screen.getByText('1–57 of 57')).toBeInTheDocument()
  })

  it('supports a custom displayedRowsLabel', () => {
    renderPagination(
      <TablePagination
        {...defaultProps}
        displayedRowsLabel={({ from, to, count }) => `${from} bis ${to} von ${count}`}
      />
    )
    expect(screen.getByText('21 bis 30 von 100')).toBeInTheDocument()
  })

  it('renders the rows-per-page selector with the default options and label', () => {
    renderPagination(<TablePagination {...defaultProps} />)
    expect(screen.getByText('Rows per page:')).toBeInTheDocument()
    const select = screen.getByRole('combobox', { name: 'Rows per page' })
    expect(select).toHaveValue('10')
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('fires onRowsPerPageChange with the numeric value', () => {
    const onRowsPerPageChange = vi.fn()
    renderPagination(
      <TablePagination {...defaultProps} onRowsPerPageChange={onRowsPerPageChange} />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } })
    expect(onRowsPerPageChange).toHaveBeenCalledWith(50)
  })

  it('supports labelled rows-per-page options', () => {
    renderPagination(
      <TablePagination {...defaultProps} rowsPerPageOptions={[10, { label: 'All', value: -1 }]} />
    )
    expect(screen.getByRole('option', { name: 'All' })).toHaveValue('-1')
  })

  it('hides the selector when fewer than two options are given', () => {
    renderPagination(<TablePagination {...defaultProps} rowsPerPageOptions={[10]} />)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByText('Rows per page:')).not.toBeInTheDocument()
  })

  it('fires onPageChange from the nav buttons', () => {
    const onPageChange = vi.fn()
    renderPagination(<TablePagination {...defaultProps} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('shows first/last buttons via the flags', () => {
    renderPagination(
      <TablePagination {...defaultProps} shouldShowFirstButton shouldShowLastButton />
    )
    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeInTheDocument()
  })

  it('disables the selector and all buttons when disabled', () => {
    renderPagination(<TablePagination {...defaultProps} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
  })

  it('supports custom labels and aria labels', () => {
    renderPagination(
      <TablePagination
        {...defaultProps}
        rowsPerPageLabel="Zeilen pro Seite:"
        getItemAriaLabel={(type) => `Zur ${type} Seite`}
      />
    )
    expect(screen.getByText('Zeilen pro Seite:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zur next Seite' })).toBeInTheDocument()
  })
})
