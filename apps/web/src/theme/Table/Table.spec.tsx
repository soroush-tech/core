import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Checkbox } from 'src/theme/Checkbox'
import { Typography } from 'src/theme/Typography'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableControl,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  useTablePagination,
  useTableSelection,
  useTableSort,
} from 'src/theme/Table'

// 23 rows → 3 pages at 10/page. Latency increases with the row number, EXCEPT a
// planted global max on service-15 and global min on service-20 — both off the
// unsorted first page, so sorting by latency surfaces rows the page slice would
// otherwise hide (proving the sort runs over the whole dataset before slicing).
interface Service {
  service: string
  region: string
  latency: number
}

const REGIONS = ['fra1', 'iad1', 'sfo1', 'sin1'] as const

const services: Service[] = Array.from({ length: 23 }, (_, i) => {
  const n = i + 1
  const planted = n === 15 ? 999 : n === 20 ? 0 : n
  return {
    service: `service-${String(n).padStart(2, '0')}`,
    region: REGIONS[i % REGIONS.length],
    latency: planted,
  }
})

function DeploymentsApp() {
  const sort = useTableSort(['service', 'latency'])
  const pagination = useTablePagination({ defaultRowsPerPage: 10 })
  const selection = useTableSelection(services.map((row) => row.service))

  return (
    <TableContainer maxHeight="320px">
      <Table size="sm" hasStickyHeader shouldHideSortIcon={false}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox {...selection.all} aria-label="Select all" />
            </TableCell>
            <TableCell sortDirection={sort.service.isActive ? sort.service.direction : undefined}>
              <TableSortLabel {...sort.service}>Service</TableSortLabel>
            </TableCell>
            <TableCell>Region</TableCell>
            <TableCell
              align="right"
              sortDirection={sort.latency.isActive ? sort.latency.direction : undefined}
            >
              <TableSortLabel {...sort.latency}>Latency (ms)</TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody data-testid="body">
          <TableControl data={services} sort={sort} pagination={pagination}>
            {(row) => (
              <TableRow
                key={row.service}
                isHoverable
                isSelected={selection.isSelected(row.service)}
              >
                <TableCell>
                  <Checkbox {...selection.row(row.service)} aria-label={`Select ${row.service}`} />
                </TableCell>
                <TableCell>{row.service}</TableCell>
                <TableCell>{row.region}</TableCell>
                <TableCell align="right">{row.latency}</TableCell>
              </TableRow>
            )}
          </TableControl>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>
              <Typography as="span" data-testid="selection-count">
                {selection.selected.length} of {services.length} selected
              </Typography>
              <button type="button" onClick={selection.clear}>
                Clear
              </button>
            </TableCell>
            <TablePagination
              count={services.length}
              {...pagination}
              colSpan={2}
              rowsPerPageOptions={[5, 10, { label: 'All', value: -1 }]}
              shouldShowFirstButton
              shouldShowLastButton
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

// These integration cases render the full composed table (23 rows, sorting,
// pagination, selection). That cold-start render can exceed the 5s default on a
// slow/overloaded CI runner, so give the file headroom.
vi.setConfig({ testTimeout: 20000 })

const getBody = () => screen.getByTestId('body')

// Visible service names, read off each row's checkbox accessible name.
const rowNames = () =>
  within(getBody())
    .getAllByRole('row')
    .map((row) =>
      within(row).getByRole('checkbox').getAttribute('aria-label')!.replace('Select ', '')
    )

const navButton = (type: 'first' | 'previous' | 'next' | 'last') =>
  screen.getByRole('button', { name: `Go to ${type} page` })

const selectionCount = () => screen.getByTestId('selection-count')

describe('Table (integration)', () => {
  it('renders the composed table sliced to the first page', () => {
    renderWithTheme(<DeploymentsApp />)

    // thead / tbody / tfoot
    expect(screen.getAllByRole('rowgroup')).toHaveLength(3)

    // header cells are column headers scoped to the column
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(4)
    headers.forEach((header) => expect(header).toHaveAttribute('scope', 'col'))

    // body sliced to 10 rows, in data order
    expect(rowNames()).toEqual([
      'service-01',
      'service-02',
      'service-03',
      'service-04',
      'service-05',
      'service-06',
      'service-07',
      'service-08',
      'service-09',
      'service-10',
    ])
    expect(screen.getByText(/^1.10 of 23$/)).toBeInTheDocument()
    expect(selectionCount()).toHaveTextContent('0 of 23 selected')
  })

  it('sorts by latency over the whole dataset, not just the visible page', () => {
    renderWithTheme(<DeploymentsApp />)
    const latencyHeader = screen.getByRole('columnheader', { name: /Latency/ })
    const serviceHeader = screen.getByRole('columnheader', { name: /Service/ })

    // first click → descending: the planted global max (service-15) leads,
    // though it never appeared on the unsorted first page
    fireEvent.click(screen.getByRole('button', { name: 'Latency (ms)' }))
    expect(rowNames()[0]).toBe('service-15')
    expect(latencyHeader).toHaveAttribute('aria-sort', 'descending')
    expect(serviceHeader).not.toHaveAttribute('aria-sort')

    // second click → ascending: the planted global min (service-20) leads
    fireEvent.click(screen.getByRole('button', { name: 'Latency (ms)' }))
    expect(rowNames()[0]).toBe('service-20')
    expect(latencyHeader).toHaveAttribute('aria-sort', 'ascending')
  })

  it('applies sorting before the slice when already on a later page', () => {
    renderWithTheme(<DeploymentsApp />)
    fireEvent.click(navButton('next')) // page index 1
    expect(screen.getByText(/^11.20 of 23$/)).toBeInTheDocument()

    // sort service descending (first click) → service-23..01; page 2 now holds ranks 11–20
    fireEvent.click(screen.getByRole('button', { name: 'Service' }))
    expect(screen.getByText(/^11.20 of 23$/)).toBeInTheDocument()
    expect(rowNames()[0]).toBe('service-13')
  })

  it('pages through the dataset with the real navigation buttons', () => {
    renderWithTheme(<DeploymentsApp />)
    expect(navButton('first')).toBeDisabled()
    expect(navButton('previous')).toBeDisabled()

    fireEvent.click(navButton('next'))
    expect(screen.getByText(/^11.20 of 23$/)).toBeInTheDocument()

    fireEvent.click(navButton('last'))
    expect(screen.getByText(/^21.23 of 23$/)).toBeInTheDocument()
    expect(rowNames()).toEqual(['service-21', 'service-22', 'service-23'])
    expect(navButton('next')).toBeDisabled()
    expect(navButton('last')).toBeDisabled()

    fireEvent.click(navButton('first'))
    expect(screen.getByText(/^1.10 of 23$/)).toBeInTheDocument()
    expect(navButton('first')).toBeDisabled()
    expect(navButton('previous')).toBeDisabled()
  })

  it('changes the page size through the real selector and resets to the first page', () => {
    renderWithTheme(<DeploymentsApp />)
    fireEvent.click(navButton('next')) // move off page 1 first

    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '5' } })
    expect(screen.getByText(/^1.5 of 23$/)).toBeInTheDocument() // reset to page 1
    expect(within(getBody()).getAllByRole('row')).toHaveLength(5)

    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '-1' } })
    expect(screen.getByText(/^1.23 of 23$/)).toBeInTheDocument() // "All"
    expect(within(getBody()).getAllByRole('row')).toHaveLength(23)
  })

  it('keeps the selection when paging back and forth', () => {
    renderWithTheme(<DeploymentsApp />)
    fireEvent.click(within(getBody()).getByRole('checkbox', { name: 'Select service-01' }))
    fireEvent.click(within(getBody()).getByRole('checkbox', { name: 'Select service-02' }))
    expect(selectionCount()).toHaveTextContent('2 of 23 selected')
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toBePartiallyChecked()

    fireEvent.click(navButton('next'))
    expect(within(getBody()).queryByRole('checkbox', { name: 'Select service-01' })).toBeNull()
    expect(selectionCount()).toHaveTextContent('2 of 23 selected') // survives the page flip

    fireEvent.click(navButton('previous'))
    expect(within(getBody()).getByRole('checkbox', { name: 'Select service-01' })).toBeChecked()
    expect(within(getBody()).getByRole('checkbox', { name: 'Select service-02' })).toBeChecked()
  })

  it('keeps the selection when the table is re-sorted', () => {
    renderWithTheme(<DeploymentsApp />)
    // service-15 is on page 2 unsorted; select it there, then sort it to the top
    fireEvent.click(navButton('next'))
    fireEvent.click(within(getBody()).getByRole('checkbox', { name: 'Select service-15' }))
    fireEvent.click(navButton('first'))

    fireEvent.click(screen.getByRole('button', { name: 'Latency (ms)' })) // desc → service-15 first
    expect(rowNames()[0]).toBe('service-15')
    expect(within(getBody()).getByRole('checkbox', { name: 'Select service-15' })).toBeChecked()
    expect(selectionCount()).toHaveTextContent('1 of 23 selected')
  })

  it('drives the dataset-wide header checkbox across pages', () => {
    renderWithTheme(<DeploymentsApp />)
    const selectAll = () => screen.getByRole('checkbox', { name: 'Select all' })

    fireEvent.click(selectAll())
    expect(selectionCount()).toHaveTextContent('23 of 23 selected')
    expect(selectAll()).toBeChecked()
    expect(selectAll()).not.toBePartiallyChecked()

    // every row on the next page is selected too
    fireEvent.click(navButton('next'))
    rowNames().forEach((name) =>
      expect(within(getBody()).getByRole('checkbox', { name: `Select ${name}` })).toBeChecked()
    )

    // unchecking one drops the header to indeterminate against the full dataset
    fireEvent.click(within(getBody()).getByRole('checkbox', { name: 'Select service-11' }))
    expect(selectionCount()).toHaveTextContent('22 of 23 selected')
    expect(selectAll()).toBePartiallyChecked()

    // clicking an indeterminate header selects all again; clicking again clears
    fireEvent.click(selectAll())
    expect(selectionCount()).toHaveTextContent('23 of 23 selected')
    fireEvent.click(selectAll())
    expect(selectionCount()).toHaveTextContent('0 of 23 selected')
  })

  it('clears the whole selection through the hook', () => {
    renderWithTheme(<DeploymentsApp />)
    fireEvent.click(within(getBody()).getByRole('checkbox', { name: 'Select service-01' }))
    fireEvent.click(within(getBody()).getByRole('checkbox', { name: 'Select service-02' }))
    expect(selectionCount()).toHaveTextContent('2 of 23 selected')

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(selectionCount()).toHaveTextContent('0 of 23 selected')
    expect(within(getBody()).getByRole('checkbox', { name: 'Select service-01' })).not.toBeChecked()
  })

  it('flows Table context (sticky header, cell density) through the whole composition', () => {
    renderWithTheme(<DeploymentsApp />)
    const serviceHeader = screen.getByRole('columnheader', { name: /Service/ })
    // hasStickyHeader reached the head cell through TableContext
    expect(serviceHeader).toHaveStyle({ position: 'sticky' })

    // size="sm" reached both head and body cells identically — the body cell
    // gets its density from context through TableControl, not a direct prop
    const bodyCell = within(within(getBody()).getAllByRole('row')[0]).getAllByRole('cell')[1]
    const headPadding = getComputedStyle(serviceHeader).paddingLeft
    expect(headPadding).not.toBe('')
    expect(getComputedStyle(bodyCell).paddingLeft).toBe(headPadding)
  })
})

describe('Table (integration) — styling & edge compositions', () => {
  it('flows table-level styling props to a section-less cell', () => {
    renderWithTheme(
      <Table align="right" borderRadius="md" cellPadding="none" hasEllipsis>
        <TableRow>
          <TableCell style={{ maxWidth: 40 }}>a-very-long-service-name</TableCell>
        </TableRow>
      </Table>
    )

    // borderRadius switches the table to the separate border model; align cascades
    const table = screen.getByRole('table')
    expect(table).toHaveStyle({ borderCollapse: 'separate', textAlign: 'right' })

    // no enclosing section → the cell resolves to a <td> (the 'body' fallback)
    const cell = screen.getByRole('cell')
    // cellPadding="none" zeroes the box; hasEllipsis truncates the overflowing text
    expect(cell).toHaveStyle({ padding: '0px' })
    expect(cell).toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    })
  })

  it('hides an inactive sort arrow by default when used standalone', () => {
    const { container } = renderWithTheme(<TableSortLabel>Service</TableSortLabel>)

    // outside a Table, shouldHideSortIcon falls back to true → the arrow is invisible
    const icon = container.querySelector('.sort-icon')!
    expect(getComputedStyle(icon).opacity).toBe('0')
  })

  it('renders the range label for an empty dataset', () => {
    renderWithTheme(
      <Table>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={0}
              page={0}
              rowsPerPage={10}
              onPageChange={() => {}}
              rowsPerPageOptions={[10, 25]}
            />
          </TableRow>
        </TableFooter>
      </Table>
    )
    expect(screen.getByText(/^0.0 of 0$/)).toBeInTheDocument()
  })

  it('renders an unknown-count range label for server-side pagination', () => {
    renderWithTheme(
      <Table>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={-1}
              page={2}
              rowsPerPage={10}
              onPageChange={() => {}}
              rowsPerPageOptions={[10, 25]}
            />
          </TableRow>
        </TableFooter>
      </Table>
    )
    expect(screen.getByText(/^21.30 of more than 30$/)).toBeInTheDocument()
  })
})
