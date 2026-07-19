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
import { textColorTokens } from '@soroush.tech/design-system/utils/test/storiesOptions'
import { Table } from '../Table'
import { TableBody } from '../TableBody'
import { TableRow } from '../TableRow'
import { TableCell } from '../TableCell'
import { TableHead } from './TableHead'

const deployments = [
  { service: 'web', region: 'fra1', latency: 42 },
  { service: 'api', region: 'fra1', latency: 87 },
  { service: 'worker', region: 'iad1', latency: 213 },
]

const meta: Meta<typeof TableHead> = {
  title: 'Theme/Table/TableHead',
  component: TableHead,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['color', 'bg', 'borderColor', 'p', 'm', 'border', 'borderWidth', 'borderStyle'],
    },
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Text color — resolves against `theme.text`.',
      table: { category: 'Visual' },
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
type Story = StoryObj<typeof TableHead>

export const Default: Story = {
  render: (args) => (
    <Table>
      <TableHead {...args}>
        <TableRow>
          <TableCell>Service</TableCell>
          <TableCell>Region</TableCell>
          <TableCell align="right">Latency (ms)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {deployments.map((row) => (
          <TableRow key={row.service} isHoverable>
            <TableCell>{row.service}</TableCell>
            <TableCell>{row.region}</TableCell>
            <TableCell align="right">{row.latency}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
