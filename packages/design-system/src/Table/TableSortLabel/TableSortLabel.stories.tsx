import type { Meta, StoryObj } from '@storybook/react-vite'
import { p, m } from '@soroush.tech/design-system/utils/test/storiesArgs'
import { Table } from '../Table'
import { TableHead } from '../TableHead'
import { TableBody } from '../TableBody'
import { TableRow } from '../TableRow'
import { TableCell } from '../TableCell'
import { TableControl } from '../TableControl'
import { useTableSort } from '../hooks/useTableSort'
import { TableSortLabel } from './TableSortLabel'

const meta: Meta<typeof TableSortLabel> = {
  title: 'Theme/Table/TableSortLabel',
  component: TableSortLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['children', 'isActive', 'direction', 'shouldHideSortIcon', 'iconName', 'p', 'm'],
    },
  },
  args: {
    children: 'Name',
    isActive: true,
    direction: 'asc',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Label contents — the arrow is appended automatically.',
      table: { category: 'Content' },
    },
    isActive: {
      control: 'boolean',
      description: 'Active styling for the currently-sorted column.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    direction: {
      control: { type: 'select' },
      options: ['asc', 'desc'],
      description: 'Current sort direction — rotates the arrow.',
      table: { category: 'Behavior', defaultValue: { summary: 'asc' } },
    },
    shouldHideSortIcon: {
      control: 'boolean',
      description:
        'Hides the inactive sort icon, revealing it on hover/focus. Set `false` to keep it always visible (dimmed). Inherited from the enclosing `Table` via `TableContext`.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    iconName: {
      control: 'text',
      description: 'Sort arrow icon from the Icon registry.',
      table: { category: 'Visual', defaultValue: { summary: 'arrow_upward' } },
    },
    p,
    m,
  },
}

export default meta
type Story = StoryObj<typeof TableSortLabel>

// Controls apply to every sort label so the effect is visible across the header.
export const Default: Story = {
  render: ({ children, ...args }) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <TableSortLabel {...args}>{children}</TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel {...args}>Region</TableSortLabel>
          </TableCell>
          <TableCell align="right">
            <TableSortLabel {...args}>Latency (ms)</TableSortLabel>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name} isHoverable>
            <TableCell>{row.name}</TableCell>
            <TableCell>fra1</TableCell>
            <TableCell align="right">{row.latency}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

const rows = [
  { name: 'web', latency: 42 },
  { name: 'api', latency: 87 },
  { name: 'worker', latency: 213 },
]

function SortableTable() {
  const sort = useTableSort(['name', 'latency'])

  return (
    <Table shouldHideSortIcon={false}>
      <TableHead>
        <TableRow>
          <TableCell sortDirection={sort.name.isActive ? sort.name.direction : undefined}>
            <TableSortLabel {...sort.name}>Service</TableSortLabel>
          </TableCell>
          <TableCell
            align="right"
            sortDirection={sort.latency.isActive ? sort.latency.direction : undefined}
          >
            <TableSortLabel {...sort.latency}>Latency (ms)</TableSortLabel>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableControl data={rows} sort={sort}>
          {(row) => (
            <TableRow key={row.name} isHoverable>
              <TableCell>{row.name}</TableCell>
              <TableCell align="right">{row.latency}</TableCell>
            </TableRow>
          )}
        </TableControl>
      </TableBody>
    </Table>
  )
}

export const SortableColumns: Story = {
  render: () => <SortableTable />,
}
