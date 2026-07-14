import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  paginationCount,
  shouldShowFirstButton,
  shouldShowLastButton,
} from '../../utils/test/storiesArgs'
import { Flex } from '../../Flex'
import { Typography } from '../../Typography'
import { TablePaginationActions } from './TablePaginationActions'

const meta: Meta<typeof TablePaginationActions> = {
  title: 'Theme/Table/TablePaginationActions',
  component: TablePaginationActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      include: [
        'count',
        'page',
        'rowsPerPage',
        'disabled',
        'shouldShowFirstButton',
        'shouldShowLastButton',
        'size',
      ],
    },
  },
  args: {
    count: 100,
    page: 2,
    rowsPerPage: 10,
    getItemAriaLabel: (type) => `Go to ${type} page`,
    onPageChange: () => {},
  },
  argTypes: {
    count: paginationCount,
    page: {
      control: { type: 'number', min: 0 },
      description: 'Zero-based current page.',
      table: { category: 'Behavior' },
    },
    rowsPerPage: {
      control: { type: 'number', min: -1 },
      description: 'Rows per page — used to derive the last page.',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all buttons.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    shouldShowFirstButton,
    shouldShowLastButton,
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Button density — resolves against `theme.sizes`.',
      table: { category: 'Layout', defaultValue: { summary: 'sm' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof TablePaginationActions>

export const Default: Story = {}

function InteractiveActions() {
  const [page, setPage] = useState(0)
  return (
    <Flex flexDirection="column" gap={2} alignItems="center">
      <Typography variant="caption" color="secondary">
        Page {page + 1} of 10
      </Typography>
      <TablePaginationActions
        count={100}
        page={page}
        rowsPerPage={10}
        onPageChange={setPage}
        getItemAriaLabel={(type) => `Go to ${type} page`}
        shouldShowFirstButton
        shouldShowLastButton
      />
    </Flex>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveActions />,
}
