import type { Meta, StoryObj } from '@storybook/react-vite'
import { Typography } from '@soroush.tech/design-system/Typography'
import { IconCard } from './IconCard'

const meta: Meta<typeof IconCard> = {
  title: 'Common/IconCard',
  component: IconCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    icon: 'account_tree',
    title: 'System Scalability',
    body: 'Designing for 10M+ users requires resilient patterns that survive traffic surges.',
  },
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: ['account_tree', 'psychology', 'smart_toy', 'speed', 'groups'],
      description: 'Icon registry name shown at the top.',
    },
    title: { control: 'text' },
    body: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof IconCard>

export const Default: Story = {}

export const WithFooter: Story = {
  render: (args) => (
    <IconCard {...args}>
      <Typography variant="caption" color="secondary" textTransform="uppercase" m={0}>
        Stack: React, NestJS, WASM
      </Typography>
    </IconCard>
  ),
}
