import type { Meta, StoryObj } from '@storybook/react-vite'
import { fontFamilyTokens } from '@soroush.tech/design-system/utils/test/storiesOptions'
import { FontStyle } from './FontStyle'

const meta = {
  title: 'Common/FontStyle',
  component: FontStyle,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['variant', 'text'] },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: fontFamilyTokens,
      description: 'Font family token from the theme.',
      table: { category: 'Content' },
    },
    text: {
      control: { type: 'text' },
      description: 'Display text rendered at large size. Defaults to "Aa".',
      table: { category: 'Content' },
    },
  },
} satisfies Meta<typeof FontStyle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'mono' },
}

export const FullCharset: Story = {
  args: {
    variant: 'heading',
    text: 'The quick brown fox jumps over the lazy dog\nTHE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\n0123456789 !@#$%^&*()_+-=[]{}|;:\'",.<>?/',
  },
}
