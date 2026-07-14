import type { Meta, StoryObj } from '@storybook/react-vite'
import { bg, opacity } from '../utils/test/storiesArgs'
import { Backdrop } from './Backdrop'

const meta: Meta<typeof Backdrop> = {
  title: 'Theme/Backdrop',
  component: Backdrop,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: {
      include: ['bg', 'opacity'],
    },
  },
  argTypes: {
    bg,
    opacity,
  },
}

export default meta
type Story = StoryObj<typeof Backdrop>

export const Default: Story = {
  args: {},
}

export const Tinted: Story = {
  args: {
    bg: 'modal',
  },
}
