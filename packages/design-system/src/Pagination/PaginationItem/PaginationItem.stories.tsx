import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  paginationColor,
  paginationVariant,
  paginationShape,
  paginationSize,
} from '@soroush.tech/design-system/utils/test/storiesArgs'
import { Flex } from '@soroush.tech/design-system/Flex'
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
    color: paginationColor,
    variant: paginationVariant,
    shape: paginationShape,
    size: paginationSize,
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
