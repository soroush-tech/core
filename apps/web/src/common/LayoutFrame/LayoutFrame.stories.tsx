import type { Meta, StoryObj } from '@storybook/react-vite'
import { Typography } from '@soroush.tech/design-system/Typography'
import { LayoutFrame } from './LayoutFrame'

const meta: Meta<typeof LayoutFrame> = {
  title: 'Common/LayoutFrame',
  component: LayoutFrame,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { include: ['layout'] },
  },
  args: {
    children: (
      <Typography variant="body1" color="secondary">
        Content framed by the theme layout grid - resize the canvas to see the margins and the max
        width follow each breakpoint.
      </Typography>
    ),
  },
  argTypes: {
    layout: {
      control: 'object',
      description: "`true` for the theme's layout grid, or overrides per breakpoint.",
      table: { category: 'Layout', defaultValue: { summary: 'true' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof LayoutFrame>

export const Default: Story = {}

export const CustomFrame: Story = {
  args: {
    layout: { xs: { margin: 6 }, lg: { maxWidth: '960px' }, xl: { maxWidth: '960px' } },
  },
}
