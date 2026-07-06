import type { Meta, StoryObj } from '@storybook/react-vite'
import { buttonColorTokens, tableSizeTokens } from 'src/theme/utils/test/storiesOptions'
import { Flex } from 'src/theme/Flex'
import { PaginationItem } from './PaginationItem'

const meta: Meta<typeof PaginationItem> = {
  title: 'Theme/Pagination/PaginationItem',
  component: PaginationItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      include: ['type', 'page', 'isSelected', 'color', 'variant', 'shape', 'size', 'disabled'],
    },
  },
  args: {
    type: 'page',
    page: 1,
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['page', 'first', 'previous', 'next', 'last', 'start-ellipsis', 'end-ellipsis'],
      description: 'What the item renders — page number, nav control, or ellipsis.',
      table: { category: 'Content', defaultValue: { summary: 'page' } },
    },
    page: {
      control: { type: 'number', min: 1 },
      description: 'The page number/content for `type="page"`.',
      table: { category: 'Content' },
    },
    isSelected: {
      control: 'boolean',
      description: 'Active styling for the current page — also sets `aria-current="page"`.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description: 'Selected-state color — resolves against `theme.palette`.',
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
      description: 'Corner shape.',
      table: { category: 'Visual', defaultValue: { summary: 'circular' } },
    },
    size: {
      control: { type: 'select' },
      options: tableSizeTokens,
      description: 'Item dimensions and font size — resolves against `theme.sizes`.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the item.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof PaginationItem>

export const Default: Story = {}

export const AllTypes: Story = {
  render: () => (
    <Flex gap={2} alignItems="center">
      <PaginationItem type="first" />
      <PaginationItem type="previous" />
      <PaginationItem page={1} />
      <PaginationItem page={2} isSelected />
      <PaginationItem type="start-ellipsis" />
      <PaginationItem page={9} />
      <PaginationItem type="next" />
      <PaginationItem type="last" />
    </Flex>
  ),
}
