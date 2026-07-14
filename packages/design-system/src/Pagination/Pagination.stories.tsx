import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  paginationColor,
  paginationVariant,
  paginationShape,
  paginationSize,
  shouldShowFirstButton,
  shouldShowLastButton,
} from '../utils/test/storiesArgs'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { Pagination } from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Theme/Pagination/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'count',
        'defaultPage',
        'siblingCount',
        'boundaryCount',
        'color',
        'variant',
        'shape',
        'size',
        'disabled',
        'shouldShowFirstButton',
        'shouldShowLastButton',
        'shouldHidePrevButton',
        'shouldHideNextButton',
      ],
    },
  },
  args: {
    count: 10,
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 0 },
      description: 'Total number of pages.',
      table: { category: 'Content' },
    },
    defaultPage: {
      control: { type: 'number', min: 1 },
      description: 'Uncontrolled initial page (1-based).',
      table: { category: 'Behavior', defaultValue: { summary: '1' } },
    },
    siblingCount: {
      control: { type: 'number', min: 0 },
      description: 'Pages always visible either side of the current page.',
      table: { category: 'Behavior', defaultValue: { summary: '1' } },
    },
    boundaryCount: {
      control: { type: 'number', min: 0 },
      description: 'Pages always visible at the start and end.',
      table: { category: 'Behavior', defaultValue: { summary: '1' } },
    },
    color: paginationColor,
    variant: paginationVariant,
    shape: paginationShape,
    size: paginationSize,
    disabled: {
      control: 'boolean',
      description: 'Disables every item.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    shouldShowFirstButton,
    shouldShowLastButton,
    shouldHidePrevButton: {
      control: 'boolean',
      description: 'Hides the previous-page button.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    shouldHideNextButton: {
      control: 'boolean',
      description: 'Hides the next-page button.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {}

export const Outlined: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      <Pagination count={10} variant="outlined" />
      <Pagination count={10} variant="outlined" color="secondary" />
      <Pagination count={10} variant="outlined" disabled />
    </Flex>
  ),
}

export const Rounded: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      <Pagination count={10} shape="rounded" />
      <Pagination count={10} variant="outlined" shape="rounded" />
    </Flex>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Pagination key={size} count={10} size={size} />
      ))}
    </Flex>
  ),
}

export const Buttons: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      <Pagination count={10} shouldShowFirstButton shouldShowLastButton />
      <Pagination count={10} shouldHidePrevButton shouldHideNextButton />
    </Flex>
  ),
}

export const Ranges: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      <Pagination count={11} defaultPage={6} siblingCount={0} />
      <Pagination count={11} defaultPage={6} />
      <Pagination count={11} defaultPage={6} siblingCount={0} boundaryCount={2} />
      <Pagination count={11} defaultPage={6} boundaryCount={2} />
    </Flex>
  ),
}

function ControlledPagination() {
  const [page, setPage] = useState(1)
  return (
    <Flex flexDirection="column" gap={2}>
      <Typography variant="caption" color="secondary">
        Page: {page}
      </Typography>
      <Pagination count={10} page={page} onChange={setPage} />
    </Flex>
  )
}

export const Controlled: Story = {
  render: () => <ControlledPagination />,
}
