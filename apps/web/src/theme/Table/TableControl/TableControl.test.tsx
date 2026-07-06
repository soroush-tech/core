import { describe, it, expect } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Table } from 'src/theme/Table/Table'
import { TableBody } from 'src/theme/Table/TableBody'
import { TableRow } from 'src/theme/Table/TableRow'
import { TableCell } from 'src/theme/Table/TableCell'
import { TableSortLabel } from 'src/theme/Table/TableSortLabel'
import { useTableSort } from 'src/theme/Table/hooks/useTableSort'
import { useTablePagination } from 'src/theme/Table/hooks/useTablePagination'
import { TableControl, type TableControlProps } from './TableControl'

interface Service {
  name: string
  latency: number
}

const services: Service[] = [
  { name: 'web', latency: 42 },
  { name: 'api', latency: 87 },
  { name: 'worker', latency: 213 },
  { name: 'cron', latency: 55 },
  { name: 'edge', latency: 12 },
]

const renderRow = (row: Service) => (
  <TableRow key={row.name}>
    <TableCell>{row.name}</TableCell>
    <TableCell align="right">{row.latency}</TableCell>
  </TableRow>
)

function Harness(props: Readonly<Partial<TableControlProps<Service>>>) {
  const sort = useTableSort(['name', 'latency'])
  const pagination = useTablePagination({ defaultRowsPerPage: 2 })
  return (
    <Table>
      <thead>
        <tr>
          <TableCell>
            <TableSortLabel {...sort.name}>Service</TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel {...sort.latency}>Latency</TableSortLabel>
          </TableCell>
        </tr>
      </thead>
      <TableBody data-testid="body">
        <TableControl data={services} sort={sort} pagination={pagination} {...props}>
          {renderRow}
        </TableControl>
      </TableBody>
    </Table>
  )
}

const bodyRowNames = () =>
  within(screen.getByTestId('body'))
    .getAllByRole('row')
    .map((row) => within(row).getAllByRole('cell')[0].textContent)

describe('TableControl', () => {
  it('renders the data in order when nothing is sorted', () => {
    renderWithTheme(
      <Table>
        <TableBody data-testid="body">
          <TableControl data={services}>{renderRow}</TableControl>
        </TableBody>
      </Table>
    )
    expect(bodyRowNames()).toEqual(['web', 'api', 'worker', 'cron', 'edge'])
  })

  it('emits rows directly as tr children of tbody (no wrapper element)', () => {
    renderWithTheme(
      <Table>
        <TableBody data-testid="body">
          <TableControl data={services}>{renderRow}</TableControl>
        </TableBody>
      </Table>
    )
    const body = screen.getByTestId('body')
    expect(body.children).toHaveLength(services.length)
    Array.from(body.children).forEach((child) => expect(child.tagName).toBe('TR'))
  })

  it('sorts by the active column — first click desc, second asc', () => {
    renderWithTheme(<Harness pagination={undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Service' }))
    expect(bodyRowNames()).toEqual(['worker', 'web', 'edge', 'cron', 'api'])
    fireEvent.click(screen.getByRole('button', { name: 'Service' }))
    expect(bodyRowNames()).toEqual(['api', 'cron', 'edge', 'web', 'worker'])
  })

  it('sorts numeric columns with the default comparator', () => {
    renderWithTheme(<Harness pagination={undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Latency' }))
    expect(bodyRowNames()).toEqual(['worker', 'api', 'cron', 'web', 'edge'])
  })

  it('passes the active key to sortFunction so each column can use different logic', () => {
    // name → sort by string length; anything else → numeric latency value.
    const sortFunction = (a: Service, b: Service, orderBy: string) =>
      orderBy === 'name' ? a.name.length - b.name.length : a.latency - b.latency
    renderWithTheme(<Harness pagination={undefined} sortFunction={sortFunction} />)

    fireEvent.click(screen.getByRole('button', { name: 'Service' }))
    // desc by name length → 'worker' (6 chars) first
    expect(bodyRowNames()[0]).toBe('worker')

    fireEvent.click(screen.getByRole('button', { name: 'Latency' }))
    // desc by latency value → 'worker' (213) first, 'edge' (12) last
    expect(bodyRowNames()).toEqual(['worker', 'api', 'cron', 'web', 'edge'])
  })

  it('slices the rows by the pagination state', () => {
    renderWithTheme(<Harness />)
    expect(bodyRowNames()).toEqual(['web', 'api'])
  })

  it('shows every row when rowsPerPage is -1', () => {
    renderWithTheme(
      <Table>
        <TableBody data-testid="body">
          <TableControl data={services} pagination={{ page: 3, rowsPerPage: -1 }}>
            {renderRow}
          </TableControl>
        </TableBody>
      </Table>
    )
    expect(bodyRowNames()).toHaveLength(services.length)
  })

  it('clamps the page to the last available one', () => {
    renderWithTheme(
      <Table>
        <TableBody data-testid="body">
          <TableControl data={services} pagination={{ page: 99, rowsPerPage: 2 }}>
            {renderRow}
          </TableControl>
        </TableBody>
      </Table>
    )
    // last page (index 2) holds the 5th row only
    expect(bodyRowNames()).toEqual(['edge'])
  })
})
