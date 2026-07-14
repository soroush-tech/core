import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  bg,
  opacity,
  cursor,
  p,
  m,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  display,
  position,
  border,
  borderWidth,
  borderStyle,
  borderColor,
  borderRadius,
} from '../../utils/test/storiesArgs'
import { Table } from '../Table'
import { TableHead } from '../TableHead'
import { TableBody } from '../TableBody'
import { TableRow } from '../TableRow'
import { TableCell } from '../TableCell'
import { TableContainer } from './TableContainer'

const columns = Array.from({ length: 12 }, (_, i) => `Metric ${i + 1}`)

const meta: Meta<typeof TableContainer> = {
  title: 'Theme/Table/TableContainer',
  component: TableContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        // visual
        'bg',
        'opacity',
        'cursor',
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
        'position',
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
    bg,
    opacity,
    cursor,
    p,
    m,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    display,
    position,
    border,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
  },
}

export default meta
type Story = StoryObj<typeof TableContainer>

export const WideTableScrolls: Story = {
  args: { maxWidth: '480px' },
  render: (args) => (
    <TableContainer {...args}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column} style={{ whiteSpace: 'nowrap' }}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column} align="right">
                {column.length}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  ),
}
