import type { Meta, StoryObj } from '@storybook/react-vite'
import { View } from './View'
import {
  aspectRatio,
  bg,
  border,
  borderColor,
  borderRadius,
  borderStyle,
  borderWidth,
  cursor,
  display,
  height,
  m,
  opacity,
  order,
  p,
  position,
  width,
} from '../utils/test/storiesArgs'

const meta: Meta<typeof View> = {
  title: 'Theme/View',
  component: View,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The base layout primitive. Renders as `<div>`. All styled-system prop groups are supported: space, layout, color, typography, flexbox, border, and position.',
      },
    },
    controls: {
      include: [
        'bg',
        'opacity',
        'p',
        'm',
        'width',
        'height',
        'display',
        'border',
        'borderWidth',
        'borderStyle',
        'borderColor',
        'borderRadius',
        'position',
        'cursor',
        'aspectRatio',
        'order',
      ],
    },
  },
  argTypes: {
    bg,
    opacity,
    p,
    m,
    width,
    height,
    display,
    border,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
    position,
    cursor,
    aspectRatio,
    order,
  },
  args: {
    children: 'View content',
  },
}

export default meta
type Story = StoryObj<typeof View>

export const Default: Story = {}

export const WithSpacingAndBackground: Story = {
  args: {
    p: 3,
    bg: 'secondary',
    borderRadius: 'md',
    children: 'Padded container with background',
  },
}

export const Positioned: Story = {
  args: {
    position: 'relative',
    height: '150px',
    bg: 'secondary',
    borderRadius: 'sm',
  },
  render: (args) => (
    <View {...args}>
      <View position="absolute" top="20px" left="20px" p={2} bg="primary" borderRadius="sm">
        Absolute child
      </View>
    </View>
  ),
}
