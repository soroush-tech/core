import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  bg,
  p,
  m,
  border,
  borderWidth,
  borderStyle,
  borderColor,
} from '@soroush.tech/design-system/utils/test/storiesArgs'
import {
  tableCellVariantTokens,
  tableCellAlignTokens,
  tableSizeTokens,
  tableCellPaddingTokens,
  textColorTokens,
  fontFamilyTokens,
  fontSizeIndices,
  fontWeightTokens,
  lineHeightTokens,
  letterSpacingTokens,
} from '@soroush.tech/design-system/utils/test/storiesOptions'
import { Table } from '../Table'
import { TableHead } from '../TableHead'
import { TableBody } from '../TableBody'
import { TableRow } from '../TableRow'
import { TableCell } from './TableCell'

const meta: Meta<typeof TableCell> = {
  title: 'Theme/Table/TableCell',
  component: TableCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        // component
        'variant',
        'align',
        'size',
        'cellPadding',
        'sortDirection',
        'hasEllipsis',
        'scope',
        // color
        'color',
        'bg',
        'borderColor',
        // typography
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        // space
        'p',
        'm',
        // border
        'border',
        'borderWidth',
        'borderStyle',
      ],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: tableCellVariantTokens,
      description:
        'Cell type — inherited from the enclosing section (`TableHead`/`TableBody`/`TableFooter`), overridable per cell. `head` renders `<th scope="col">`.',
      table: { category: 'Behavior' },
    },
    align: {
      control: { type: 'select' },
      options: tableCellAlignTokens,
      description: 'Text alignment of the cell content. Numbers should be right-aligned.',
      table: { category: 'Layout', defaultValue: { summary: 'inherit' } },
    },
    size: {
      control: { type: 'select' },
      options: tableSizeTokens,
      description: 'Cell density — inherited from the `Table`, overridable per cell.',
      table: { category: 'Layout' },
    },
    cellPadding: {
      control: { type: 'select' },
      options: tableCellPaddingTokens,
      description: 'Padding mode — inherited from the `Table`. `none` zeroes padding.',
      table: { category: 'Layout' },
    },
    sortDirection: {
      control: { type: 'select' },
      options: ['asc', 'desc'],
      description: 'Sets `aria-sort` on the cell — pair with `TableSortLabel` for the control.',
      table: { category: 'Behavior' },
    },
    hasEllipsis: {
      control: 'boolean',
      description:
        "Truncates overflowing text with an ellipsis — inherits the `Table`'s `hasEllipsis`. Needs a constrained width (e.g. `maxWidth`) to kick in.",
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    scope: {
      control: 'text',
      description:
        'Native scope attribute — defaults to `col` on header cells for screen-reader navigation.',
      table: { category: 'Behavior' },
    },
    color: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Text color — resolves against `theme.text`.',
      table: { category: 'Visual' },
    },
    bg,
    borderColor,
    fontFamily: {
      control: { type: 'select' },
      options: fontFamilyTokens,
      description: 'Font family — resolves against `theme.fonts`.',
      table: { category: 'Typography' },
    },
    fontSize: {
      control: { type: 'select' },
      options: fontSizeIndices,
      description: 'Font size index — resolves against `theme.fontSizes`.',
      table: { category: 'Typography' },
    },
    fontWeight: {
      control: { type: 'select' },
      options: fontWeightTokens,
      description: 'Font weight — resolves against `theme.fontWeights`.',
      table: { category: 'Typography' },
    },
    lineHeight: {
      control: { type: 'select' },
      options: lineHeightTokens,
      description: 'Line height — resolves against `theme.lineHeights`.',
      table: { category: 'Typography' },
    },
    letterSpacing: {
      control: { type: 'select' },
      options: letterSpacingTokens,
      description: 'Letter spacing — resolves against `theme.letterSpacings`.',
      table: { category: 'Typography' },
    },
    p,
    m,
    border,
    borderWidth,
    borderStyle,
  },
}

export default meta
type Story = StoryObj<typeof TableCell>

const deployments = [
  { service: 'web', region: 'fra1', latency: 42 },
  { service: 'api', region: 'fra1', latency: 87 },
  { service: 'worker', region: 'iad1', latency: 213 },
]

// Controls apply to every cell — head and body — so the effect is visible table-wide.
export const Default: Story = {
  render: (args) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell {...args}>Service</TableCell>
          <TableCell {...args}>Region</TableCell>
          <TableCell align="right" {...args}>
            Latency (ms)
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {deployments.map((row) => (
          <TableRow key={row.service}>
            <TableCell {...args}>{row.service}</TableCell>
            <TableCell {...args}>{row.region}</TableCell>
            <TableCell align="right" {...args}>
              {row.latency}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Densities: Story = {
  render: () => (
    <Table>
      <TableBody>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <TableRow key={size}>
            <TableCell size={size}>{size} density</TableCell>
            <TableCell size={size} align="right">
              42
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
