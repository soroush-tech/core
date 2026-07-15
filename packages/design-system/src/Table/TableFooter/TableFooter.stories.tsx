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
import { textColorTokens } from '../../utils/test/storiesOptions'
import { Table } from '../Table'
import { TableHead } from '../TableHead'
import { TableBody } from '../TableBody'
import { TableRow } from '../TableRow'
import { TableCell } from '../TableCell'
import { TableFooter } from './TableFooter'

const deployments = [
  { service: 'web', region: 'fra1', latency: 42 },
  { service: 'api', region: 'fra1', latency: 87 },
  { service: 'worker', region: 'iad1', latency: 213 },
]

const meta: Meta<typeof TableFooter> = {
  title: 'Theme/Table/TableFooter',
  component: TableFooter,
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
type Story = StoryObj<typeof TableFooter>

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
      <TableBody>
        {deployments.map((row) => (
          <TableRow key={row.service} isHoverable>
            <TableCell>{row.service}</TableCell>
            <TableCell>{row.region}</TableCell>
            <TableCell align="right">{row.latency}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter {...args}>
        <TableRow>
          <TableCell colSpan={2}>Total services</TableCell>
          <TableCell align="right">{deployments.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}
