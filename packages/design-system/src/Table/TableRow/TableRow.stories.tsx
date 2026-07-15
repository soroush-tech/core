import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  bg,
  p,
  m,
  border,
  borderWidth,
  borderStyle,
  borderColor,
} from '../../utils/test/storiesArgs'
import { buttonColorTokens } from '../../utils/test/storiesOptions'
import { Table } from '../Table'
import { TableHead } from '../TableHead'
import { TableBody } from '../TableBody'
import { TableCell } from '../TableCell'
import { TableRow } from './TableRow'

const deployments = [
  { service: 'web', region: 'fra1', latency: 42 },
  { service: 'api', region: 'fra1', latency: 87 },
  { service: 'worker', region: 'iad1', latency: 213 },
]

const meta: Meta<typeof TableRow> = {
  title: 'Theme/Table/TableRow',
  component: TableRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'isHoverable',
        'isSelected',
        'color',
        'bg',
        'borderColor',
        'p',
        'm',
        'border',
        'borderWidth',
        'borderStyle',
      ],
    },
  },
  argTypes: {
    isHoverable: {
      control: 'boolean',
      description: 'Shades the row on hover with `theme.palette[color].light`.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    isSelected: {
      control: 'boolean',
      description: 'Fills the row with `theme.palette[color].dark` + contrast text.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description:
        'Palette color for the hover/selected shading — resolves against `theme.palette`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    bg,
    borderColor,
    p,
    m,
    border,
    borderWidth,
    borderStyle,
  },
}

export default meta
type Story = StoryObj<typeof TableRow>

// Controls apply to every body row so the effect is visible across the table.
export const Default: Story = {
  args: { isHoverable: true },
  render: (args) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Service</TableCell>
          <TableCell>Region</TableCell>
          <TableCell align="right">Latency (ms)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {deployments.map((row) => (
          <TableRow key={row.service} {...args}>
            <TableCell>{row.service}</TableCell>
            <TableCell>{row.region}</TableCell>
            <TableCell align="right">{row.latency}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const States: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>State</TableCell>
          <TableCell>Service</TableCell>
          <TableCell align="right">Latency (ms)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>default</TableCell>
          <TableCell>web</TableCell>
          <TableCell align="right">42</TableCell>
        </TableRow>
        <TableRow isHoverable>
          <TableCell>isHoverable</TableCell>
          <TableCell>api</TableCell>
          <TableCell align="right">87</TableCell>
        </TableRow>
        <TableRow isSelected>
          <TableCell>isSelected</TableCell>
          <TableCell>worker</TableCell>
          <TableCell align="right">213</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
