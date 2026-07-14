import type { Meta, StoryObj } from '@storybook/react-vite'
import { TablePicker } from './TablePicker'

const meta: Meta<typeof TablePicker> = {
  title: 'Theme/Markdown/TablePicker',
  component: TablePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: [] },
  },
  args: { onSelect: () => {} },
}

export default meta
type Story = StoryObj<typeof TablePicker>

export const Default: Story = {}
