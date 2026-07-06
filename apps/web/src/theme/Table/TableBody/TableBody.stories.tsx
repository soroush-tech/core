import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  bg,
  p,
  m,
  border,
  borderWidth,
  borderStyle,
  borderColor,
} from 'src/theme/utils/test/storiesArgs'
import { textColorTokens } from 'src/theme/utils/test/storiesOptions'
import { Table } from 'src/theme/Table/Table'
import { TableHead } from 'src/theme/Table/TableHead'
import { TableRow } from 'src/theme/Table/TableRow'
import { TableCell } from 'src/theme/Table/TableCell'
import { TableBody } from './TableBody'

const deployments = [
  { service: 'web', region: 'fra1', latency: 42 },
  { service: 'api', region: 'fra1', latency: 87 },
  { service: 'worker', region: 'iad1', latency: 213 },
]

const meta: Meta<typeof TableBody> = {
  title: 'Theme/Table/TableBody',
  component: TableBody,
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
type Story = StoryObj<typeof TableBody>

export const Default: Story = {
  render: (args) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Service</TableCell>
          <TableCell>Region</TableCell>
          <TableCell align="right">Latency (ms)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody {...args}>
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
