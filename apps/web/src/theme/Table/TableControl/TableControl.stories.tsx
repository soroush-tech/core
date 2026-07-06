import type { Meta, StoryObj } from '@storybook/react-vite'
import { Table } from 'src/theme/Table/Table'
import { TableHead } from 'src/theme/Table/TableHead'
import { TableBody } from 'src/theme/Table/TableBody'
import { TableFooter } from 'src/theme/Table/TableFooter'
import { TableRow } from 'src/theme/Table/TableRow'
import { TableCell } from 'src/theme/Table/TableCell'
import { TableSortLabel } from 'src/theme/Table/TableSortLabel'
import { TablePagination } from 'src/theme/Table/TablePagination'
import { useTableSort } from 'src/theme/Table/hooks/useTableSort'
import { useTablePagination } from 'src/theme/Table/hooks/useTablePagination'
import { TableControl } from './TableControl'

interface Service {
  name: string
  region: string
  latency: number
}

const REGIONS = ['fra1', 'iad1', 'sfo1', 'sin1'] as const

const services: Service[] = Array.from({ length: 23 }, (_, i) => ({
  name: `service-${String(i + 1).padStart(2, '0')}`,
  region: REGIONS[i % REGIONS.length],
  latency: 8 + ((i * 13) % 220),
}))

const meta: Meta<typeof TableControl<Service>> = {
  title: 'Theme/Table/TableControl',
  component: TableControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['data'],
    },
  },
  args: {
    data: services,
  },
  argTypes: {
    data: {
      control: 'object',
      description: 'The full dataset — `TableControl` derives the visible rows from it.',
      table: { category: 'Content' },
    },
  },
}

export default meta
type Story = StoryObj<typeof TableControl<Service>>

function SortedAndPaginated({ data }: Readonly<{ data: Service[] }>) {
  const sort = useTableSort(['name', 'latency'])
  const pagination = useTablePagination({ defaultRowsPerPage: 5 })

  return (
    <Table size="sm" shouldHideSortIcon={false}>
      <TableHead>
        <TableRow>
          <TableCell sortDirection={sort.name.isActive ? sort.name.direction : undefined}>
            <TableSortLabel {...sort.name}>Service</TableSortLabel>
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
      <TableBody>
        <TableControl data={data} sort={sort} pagination={pagination}>
          {(row) => (
            <TableRow key={row.name} isHoverable>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell align="right">{row.latency}</TableCell>
            </TableRow>
          )}
        </TableControl>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination
            count={data.length}
            {...pagination}
            rowsPerPageOptions={[5, 10, { label: 'All', value: -1 }]}
          />
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export const Default: Story = {
  render: (args) => <SortedAndPaginated data={[...args.data]} />,
}

function SortOnly({ data }: Readonly<{ data: Service[] }>) {
  const sort = useTableSort(['name', 'latency'])
  return (
    <Table size="sm" shouldHideSortIcon={false}>
      <TableHead>
        <TableRow>
          <TableCell sortDirection={sort.name.isActive ? sort.name.direction : undefined}>
            <TableSortLabel {...sort.name}>Service</TableSortLabel>
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
      <TableBody>
        <TableControl data={data.slice(0, 6)} sort={sort}>
          {(row) => (
            <TableRow key={row.name} isHoverable>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell align="right">{row.latency}</TableCell>
            </TableRow>
          )}
        </TableControl>
      </TableBody>
    </Table>
  )
}

export const SortOnlyTable: Story = {
  render: (args) => <SortOnly data={[...args.data]} />,
}
