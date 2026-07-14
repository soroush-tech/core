import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  m,
  p,
  bg,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  display,
  border,
  borderWidth,
  borderStyle,
  borderColor,
  borderRadius,
} from '../../utils/test/storiesArgs'
import {
  tableSizeTokens,
  tableCellPaddingTokens,
  buttonColorTokens,
} from '../../utils/test/storiesOptions'
import { TableContainer } from '../TableContainer'
import { TableHead } from '../TableHead'
import { TableBody } from '../TableBody'
import { TableFooter } from '../TableFooter'
import { TableRow } from '../TableRow'
import { TableCell } from '../TableCell'
import { TableSortLabel } from '../TableSortLabel'
import { TableControl } from '../TableControl'
import { useTablePagination } from '../hooks/useTablePagination'
import { useTableSelection } from '../hooks/useTableSelection'
import { useTableSort, type TableSortMap } from '../hooks/useTableSort'
import { TablePagination } from '../TablePagination'
import { Checkbox } from '../../Checkbox'
import { Typography } from '../../Typography'
import { Table, type TableProps } from './Table'

const deployments = [
  { service: 'web', region: 'fra1', status: 'healthy', latency: 42 },
  { service: 'api', region: 'fra1', status: 'healthy', latency: 87 },
  { service: 'worker', region: 'iad1', status: 'degraded', latency: 213 },
  { service: 'cron', region: 'iad1', status: 'healthy', latency: 55 },
  { service: 'edge', region: 'sin1', status: 'healthy', latency: 12 },
  { service: 'db-proxy', region: 'fra1', status: 'healthy', latency: 31 },
  { service: 'queue', region: 'sfo1', status: 'degraded', latency: 158 },
  { service: 'auth', region: 'fra1', status: 'healthy', latency: 64 },
  { service: 'cdn', region: 'global', status: 'healthy', latency: 8 },
  { service: 'search', region: 'iad1', status: 'healthy', latency: 96 },
  { service: 'mailer', region: 'sfo1', status: 'healthy', latency: 120 },
  { service: 'metrics', region: 'sin1', status: 'degraded', latency: 176 },
]

// Sortable Service/Region/Status/Latency header cells — shared by the tables below
// (SelectableTable prepends a checkbox cell before these).
function ServiceHeadCells({ sort }: Readonly<{ sort: TableSortMap<'service' | 'latency'> }>) {
  return (
    <>
      <TableCell sortDirection={sort.service.isActive ? sort.service.direction : undefined}>
        <TableSortLabel {...sort.service}>Service</TableSortLabel>
      </TableCell>
      <TableCell>Region</TableCell>
      <TableCell>Status</TableCell>
      <TableCell
        align="right"
        sortDirection={sort.latency.isActive ? sort.latency.direction : undefined}
      >
        <TableSortLabel {...sort.latency}>Latency (ms)</TableSortLabel>
      </TableCell>
    </>
  )
}

/** Sortable deployments table — extra children (e.g. a TableFooter) render after the body. */
function DeploymentsTable({ children, ...tableProps }: Readonly<TableProps>) {
  const sort = useTableSort(['service', 'latency'])

  return (
    <Table {...tableProps}>
      <TableHead>
        <TableRow>
          <ServiceHeadCells sort={sort} />
        </TableRow>
      </TableHead>
      <TableBody>
        <TableControl data={deployments} sort={sort}>
          {(row) => (
            <TableRow key={row.service} isHoverable>
              <TableCell>{row.service}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell align="right">{row.latency}</TableCell>
            </TableRow>
          )}
        </TableControl>
      </TableBody>
      {children}
    </Table>
  )
}

const meta: Meta<typeof Table> = {
  title: 'Theme/Table/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        // component
        'size',
        'cellPadding',
        'hasStickyHeader',
        'shouldHideSortIcon',
        'hasEllipsis',
        'align',
        // color
        'color',
        'bg',
        // space
        'p',
        'm',
        // layout
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
        'display',
        // border
        'border',
        'borderWidth',
        'borderStyle',
        'borderColor',
        'borderRadius',
      ],
    },
  },
  argTypes: {
    align: {
      control: { type: 'select' },
      options: ['left', 'right', 'center', 'justify'],
      description:
        'Default text alignment for every cell — cells with `align="inherit"` follow it.',
      table: { category: 'Layout' },
    },
    size: {
      control: { type: 'select' },
      options: tableSizeTokens,
      description: 'Cell density — broadcast to descendant `TableCell`s via `TableContext`.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    cellPadding: {
      control: { type: 'select' },
      options: tableCellPaddingTokens,
      description: 'Cell padding mode — `none` zeroes cell padding.',
      table: { category: 'Layout', defaultValue: { summary: 'normal' } },
    },
    hasStickyHeader: {
      control: 'boolean',
      description:
        'Makes header cells stick to the top of a scrolling `TableContainer` with a bounded height.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    shouldHideSortIcon: {
      control: 'boolean',
      description:
        'Hides inactive sort icons (revealed on hover/focus) — broadcast to `TableSortLabel`s via `TableContext`. Set `false` to keep them always visible (dimmed).',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    hasEllipsis: {
      control: 'boolean',
      description:
        'Truncates overflowing cell text with an ellipsis — broadcast to `TableCell`s via `TableContext`. Cells need a constrained width for the truncation to kick in.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description:
        "Palette color for descendant rows' hover/selected shading — broadcast to `TableRow`s via `TableContext`; a row's own `color` wins.",
      table: { category: 'Visual' },
    },
    bg,
    p,
    m,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    display,
    border,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
  },
}

export default meta
type Story = StoryObj<typeof Table>

export const Default: Story = {
  render: (args) => <DeploymentsTable {...args} />,
}

export const Composed: Story = {
  render: (args) => (
    <TableContainer maxHeight="320px" borderColor="light" borderWidth="thin" borderStyle="solid">
      <DeploymentsTable hasStickyHeader {...args}>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total services</TableCell>
            <TableCell align="right">{deployments.length}</TableCell>
          </TableRow>
        </TableFooter>
      </DeploymentsTable>
    </TableContainer>
  ),
}

export const Dense: Story = {
  render: () => <DeploymentsTable size="sm" bg="paper" />,
}

/**
 * Row selection — `useTableSelection` keeps the selection keyed by row identity,
 * so it survives page flips and re-sorting; select-all/indeterminate run
 * against the whole dataset, not the visible page.
 */
function SelectableTable() {
  const selection = useTableSelection(deployments.map((row) => row.service))
  const pagination = useTablePagination({ defaultRowsPerPage: 5 })
  const sort = useTableSort(['service', 'latency'])

  return (
    <Table size="sm" shouldHideSortIcon={false}>
      <TableHead>
        <TableRow>
          <TableCell>
            <Checkbox
              size="sm"
              color="primary"
              {...selection.all}
              aria-label="Select all deployments"
            />
          </TableCell>
          <ServiceHeadCells sort={sort} />
        </TableRow>
      </TableHead>
      <TableBody>
        <TableControl data={deployments} sort={sort} pagination={pagination}>
          {(row) => (
            <TableRow key={row.service} isHoverable isSelected={selection.isSelected(row.service)}>
              <TableCell>
                <Checkbox
                  size="sm"
                  color="primary"
                  {...selection.row(row.service)}
                  aria-label={`Select ${row.service}`}
                />
              </TableCell>
              <TableCell>{row.service}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell align="right">{row.latency}</TableCell>
            </TableRow>
          )}
        </TableControl>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>
            <Typography variant="caption" color="secondary" as="span">
              {selection.selected.length} of {deployments.length} selected
            </Typography>
          </TableCell>
          <TablePagination
            count={deployments.length}
            {...pagination}
            rowsPerPageOptions={[5, 10]}
            colSpan={3}
          />
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export const RowSelection: Story = {
  render: () => <SelectableTable />,
}
