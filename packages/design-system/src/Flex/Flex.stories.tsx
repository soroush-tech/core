import type { Meta, StoryObj } from '@storybook/react-vite'
import { gap, maxHeight, maxWidth, minHeight, minWidth } from '../utils/test/storiesArgs'
import {
  flexAlignItemsTokens,
  flexDirectionTokens,
  flexJustifyContentTokens,
  flexWrapTokens,
} from '../utils/test/storiesOptions'
import { View } from '../View'
import { Flex } from './Flex'

const meta: Meta<typeof Flex> = {
  title: 'Theme/Flex',
  component: Flex,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Extends [`View`](../View). Renders as a `<div>` with `display: flex` and `flex-direction: column` by default. All `View` props are inherited.',
      },
    },
    controls: {
      include: [
        'flexDirection',
        'justifyContent',
        'alignItems',
        'flexWrap',
        'gap',
        'p',
        'm',
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
        'border',
        'borderWidth',
        'borderStyle',
        'borderColor',
        'borderRadius',
        'opacity',
        'bg',
        'position',
      ],
    },
  },
  argTypes: {
    flexDirection: {
      control: { type: 'select' },
      options: flexDirectionTokens,
      description: 'CSS flex-direction.',
      table: {
        category: 'Layout',
        type: { summary: 'string' },
        defaultValue: { summary: 'column' },
      },
    },
    justifyContent: {
      control: { type: 'select' },
      options: flexJustifyContentTokens,
      description: 'CSS justify-content.',
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    alignItems: {
      control: { type: 'select' },
      options: flexAlignItemsTokens,
      description: 'CSS align-items.',
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    flexWrap: {
      control: { type: 'select' },
      options: flexWrapTokens,
      description: 'CSS flex-wrap.',
      table: {
        category: 'Layout',
        type: { summary: 'string' },
        defaultValue: { summary: 'nowrap' },
      },
    },
    gap,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  },
  args: {
    flexDirection: 'column',
    gap: 2,
    p: 2,
    width: '360px',
    height: '280px',
    bg: 'secondary',
    borderRadius: 'sm',
    children: (
      <>
        <View p={2} bg="primary" borderRadius="sm">
          A
        </View>
        <View p={2} bg="primary" borderRadius="sm">
          B
        </View>
        <View p={2} bg="primary" borderRadius="sm">
          C
        </View>
      </>
    ),
  },
}

export default meta
type Story = StoryObj<typeof Flex>

export const Column: Story = {
  args: { flexDirection: 'column' },
}

export const Row: Story = {
  args: { flexDirection: 'row' },
}

export const JustifyCenter: Story = {
  args: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
    bg: 'secondary',
    borderRadius: 'sm',
  },
}

export const SpaceBetween: Story = {
  args: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 2,
    bg: 'secondary',
    borderRadius: 'sm',
  },
}

export const Wrap: Story = {
  args: { flexDirection: 'row', flexWrap: 'wrap', height: 'auto' },
  render: (args) => (
    <Flex {...args}>
      {Array.from({ length: 9 }, (_, i) => (
        <View key={i} p={2} bg="primary" borderRadius="sm" width="100px">
          {i + 1}
        </View>
      ))}
    </Flex>
  ),
}
