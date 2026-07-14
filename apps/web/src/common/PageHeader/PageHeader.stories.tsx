import type { Meta, StoryObj } from '@storybook/react-vite'
import { Typography } from '@soroush.tech/design-system/Typography'
import { minHeight } from '@soroush.tech/design-system/utils/test/storiesArgs'
import { PageHeader } from './PageHeader'

const meta: Meta<typeof PageHeader> = {
  title: 'Common/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: {
      include: ['title', 'minHeight'],
    },
  },
  args: {
    title: 'Articles',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Optional heading rendered with the Hero H1 style above the children.',
      table: { category: 'Content' },
    },
    minHeight,
  },
}

export default meta
type Story = StoryObj<typeof PageHeader>

export const WithTitle: Story = {}

export const WithChildren: Story = {
  args: { title: undefined },
  render: (args) => (
    <PageHeader {...args}>
      <Typography variant="h1" color="initial" m={0}>
        Custom children
      </Typography>
      <Typography variant="body1" color="secondary" m={0}>
        Pass any composition as children — the Hero does exactly this.
      </Typography>
    </PageHeader>
  ),
}
