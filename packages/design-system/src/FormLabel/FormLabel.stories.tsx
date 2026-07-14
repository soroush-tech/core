import type { Meta, StoryObj } from '@storybook/react-vite'
import { textColorTokens } from '../utils/test/storiesOptions'
import { FormControl } from '../FormControl'
import { FormLabel } from './FormLabel'

const meta: Meta<typeof FormLabel> = {
  title: 'Theme/FormLabel',
  component: FormLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['children', 'required', 'color'] },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Label text.',
      table: { category: 'Content' },
    },
    required: {
      control: 'boolean',
      description: 'Appends a `*` indicator. Falls back to the FormControl `required` value.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: textColorTokens,
      description:
        'Text color — resolves against `theme.text`. Inherits `textColor` from context when unset.',
      table: { category: 'Visual' },
    },
  },
}

export default meta
type Story = StoryObj<typeof FormLabel>

export const Default: Story = {
  args: { children: 'Email' },
}

export const Required: Story = {
  args: { children: 'Email', required: true },
}

export const FromContext: Story = {
  render: () => (
    <FormControl id="email" required>
      <FormLabel>Email</FormLabel>
    </FormControl>
  ),
}
