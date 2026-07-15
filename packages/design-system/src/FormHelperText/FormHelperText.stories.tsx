import type { Meta, StoryObj } from '@storybook/react-vite'
import { textColorTokens } from '../utils/test/storiesOptions'
import { FormControl } from '../FormControl'
import { FormHelperText } from './FormHelperText'

const meta: Meta<typeof FormHelperText> = {
  title: 'Theme/FormHelperText',
  component: FormHelperText,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['children', 'error', 'color'] },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Helper or error text.',
      table: { category: 'Content' },
    },
    error: {
      control: 'boolean',
      description:
        'Renders in the error color and announces via `role="alert"`. Falls back to the FormControl `error` value.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: textColorTokens,
      description:
        'Text color — resolves against `theme.text`. Inherits `textColor` from context when unset; ignored in the error state.',
      table: { category: 'Visual', defaultValue: { summary: 'secondary' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof FormHelperText>

export const Default: Story = {
  args: { children: "We'll never share it." },
}

export const ErrorState: Story = {
  args: { children: 'Enter a valid e-mail address.', error: true },
}

export const FromContext: Story = {
  render: () => (
    <FormControl id="email" error>
      <FormHelperText>Enter a valid e-mail address.</FormHelperText>
    </FormControl>
  ),
}
