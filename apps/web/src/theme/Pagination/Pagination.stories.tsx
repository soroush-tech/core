import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { buttonColorTokens, tableSizeTokens } from 'src/theme/utils/test/storiesOptions'
import { Flex } from 'src/theme/Flex'
import { Typography } from 'src/theme/Typography'
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
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description: 'Selected-item color — resolves against `theme.palette`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    variant: {
      control: { type: 'select' },
      options: ['text', 'outlined'],
      description: 'Item style.',
      table: { category: 'Visual', defaultValue: { summary: 'text' } },
    },
    shape: {
      control: { type: 'select' },
      options: ['circular', 'rounded'],
      description: 'Item corner shape.',
      table: { category: 'Visual', defaultValue: { summary: 'circular' } },
    },
    size: {
      control: { type: 'select' },
      options: tableSizeTokens,
      description: 'Item density — resolves against `theme.sizes`.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every item.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    shouldShowFirstButton: {
      control: 'boolean',
      description: 'Shows the first-page button.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    shouldShowLastButton: {
      control: 'boolean',
      description: 'Shows the last-page button.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
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
