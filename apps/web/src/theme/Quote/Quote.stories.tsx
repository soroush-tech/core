import type { Meta, StoryObj } from '@storybook/react-vite'
import { bg, p, m, borderRadius } from 'src/theme/utils/test/storiesArgs'
import { Typography } from 'src/theme/Typography'
import { Quote } from './Quote'

const meta: Meta<typeof Quote> = {
  title: 'Theme/Quote',
  component: Quote,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['bg', 'p', 'm', 'borderRadius'] },
  },
  args: { bg: 'terminal', p: 3 },
  argTypes: { bg, p, m, borderRadius },
  render: (args) => (
    <Quote {...args}>
      <Typography variant="body1" color="secondary" m={0}>
        A View with a 2px primary left border — for terminal readouts and markdown blockquotes.
      </Typography>
    </Quote>
  ),
}

export default meta
type Story = StoryObj<typeof Quote>

export const Default: Story = {}

export const Rounded: Story = {
  args: { borderRadius: 'md' },
}
