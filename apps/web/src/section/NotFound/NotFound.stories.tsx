import type { Meta, StoryObj } from '@storybook/react-vite'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Layout } from 'src/common/Layout'
import { NotFound } from './NotFound'

const meta = {
  title: 'Section/NotFound',
  component: NotFound,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { include: [] },
  },
  // NotFound uses `flex={1}` to fill and center within Layout's `main`; give it a
  // full-height flex column so the card centers as it does in the real page.
  decorators: [
    (Story) => (
      <Flex flexDirection="column" minHeight="100vh">
        <Story />
      </Flex>
    ),
  ],
} satisfies Meta<typeof NotFound>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const InLayout: Story = {
  decorators: [
    (Story) => (
      <Layout>
        <Story />
      </Layout>
    ),
  ],
}
