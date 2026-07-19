import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  bg,
  p,
  m,
  paginationCount,
  shouldShowFirstButton,
  shouldShowLastButton,
} from '@soroush.tech/design-system/utils/test/storiesArgs'
import {
  tableSizeTokens,
  tableCellPaddingTokens,
  textColorTokens,
} from '@soroush.tech/design-system/utils/test/storiesOptions'
import { Table } from '../Table'
import { TableHead } from '../TableHead'
import { TableBody } from '../TableBody'
import { TableFooter } from '../TableFooter'
import { TableRow } from '../TableRow'
import { TableCell } from '../TableCell'
import { TableControl } from '../TableControl'
import { useTablePagination } from '../hooks/useTablePagination'
import { TablePagination } from './TablePagination'

const meta: Meta<typeof TablePagination> = {
  title: 'Theme/Table/TablePagination',
  component: TablePagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        // component
        'count',
        'page',
        'rowsPerPage',
        'rowsPerPageOptions',
        'disabled',
        'shouldShowFirstButton',
        'shouldShowLastButton',
        'rowsPerPageLabel',
        'colSpan',
        // inherited TableCell styling
        'size',
        'cellPadding',
        'color',
        'bg',
        'p',
        'm',
      ],
    },
  },
  args: {
    count: 100,
    page: 2,
    rowsPerPage: 10,
  },
  argTypes: {
    count: paginationCount,
    page: {
      control: { type: 'number', min: 0 },
      description: 'Zero-based current page (controlled).',
      table: { category: 'Behavior' },
    },
    rowsPerPage: {
      control: { type: 'number', min: -1 },
      description: 'Rows per page; `-1` shows all rows (controlled).',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all controls.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    shouldShowFirstButton,
    shouldShowLastButton,
    rowsPerPageLabel: {
      control: 'text',
      description: 'Label for the rows-per-page selector.',
      table: { category: 'Content', defaultValue: { summary: 'Rows per page:' } },
    },
    rowsPerPageOptions: {
      control: 'object',
      description:
        'Selector options — numbers or `{ label, value }`; fewer than two hides the selector.',
      table: { category: 'Content', defaultValue: { summary: '[10, 25, 50, 100]' } },
    },
    colSpan: {
      control: { type: 'number', min: 1 },
      description: 'Spans the footer row.',
      table: { category: 'Layout', defaultValue: { summary: '1000' } },
    },
    size: {
      control: { type: 'select' },
      options: tableSizeTokens,
      description: 'Cell density — inherited from the `Table`, overridable here.',
      table: { category: 'Layout' },
    },
    cellPadding: {
      control: { type: 'select' },
      options: tableCellPaddingTokens,
      description: 'Padding mode — inherited from the `Table`. `none` zeroes padding.',
      table: { category: 'Layout' },
    },
    color: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Text color — resolves against `theme.text`.',
      table: { category: 'Visual' },
    },
    bg,
    p,
    m,
  },
}

export default meta
type Story = StoryObj<typeof TablePagination>

const REGIONS = ['fra1', 'iad1', 'sfo1', 'sin1'] as const
const STATUSES = ['healthy', 'healthy', 'healthy', 'degraded'] as const

const services = Array.from({ length: 57 }, (_, i) => ({
  name: `service-${String(i + 1).padStart(2, '0')}`,
  region: REGIONS[i % REGIONS.length],
  status: STATUSES[(i * 7) % STATUSES.length],
  latency: 8 + ((i * 13) % 220),
}))

const sliceForPage = (page: number, rowsPerPage: number) =>
  rowsPerPage === -1 ? services : services.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

const serviceRows = (rows: typeof services) =>
  rows.map((row) => (
    <TableRow key={row.name} isHoverable>
      <TableCell>{row.name}</TableCell>
      <TableCell>{row.region}</TableCell>
      <TableCell>{row.status}</TableCell>
      <TableCell align="right">{row.latency}</TableCell>
    </TableRow>
  ))

const headRow = (
  <TableRow>
    <TableCell>Service</TableCell>
    <TableCell>Region</TableCell>
    <TableCell>Status</TableCell>
    <TableCell align="right">Latency (ms)</TableCell>
  </TableRow>
)

// The body slices the 57-row dataset by the page/rowsPerPage controls, so
// paging through the args shows real data changing.
export const Default: Story = {
  args: { count: services.length },
  render: (args) => (
    <Table size="sm">
      <TableHead>{headRow}</TableHead>
      <TableBody>{serviceRows(sliceForPage(args.page, args.rowsPerPage))}</TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination {...args} />
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

function PaginatedTable() {
  const pagination = useTablePagination({ defaultRowsPerPage: 10 })

  return (
    <Table size="sm">
      <TableHead>{headRow}</TableHead>
      <TableBody>
        <TableControl data={services} pagination={pagination}>
          {(row) => (
            <TableRow key={row.name} isHoverable>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell align="right">{row.latency}</TableCell>
            </TableRow>
          )}
        </TableControl>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination
            count={services.length}
            {...pagination}
            shouldShowFirstButton
            shouldShowLastButton
          />
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export const InAFullTable: Story = {
  render: () => <PaginatedTable />,
}
