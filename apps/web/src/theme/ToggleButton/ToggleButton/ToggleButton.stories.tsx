import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { buttonColorTokens, tableSizeTokens } from 'src/theme/utils/test/storiesOptions'
import { Icon } from 'src/theme/Icon'
import { ToggleButton } from './ToggleButton'

const meta: Meta<typeof ToggleButton> = {
  title: 'Theme/ToggleButton/ToggleButton',
  component: ToggleButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['value', 'isSelected', 'color', 'size', 'fullWidth', 'disabled', 'loading'],
    },
  },
  args: {
    value: 'check',
    children: 'Check',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'The value associated with the button inside a `ToggleButtonGroup`.',
      table: { category: 'Content' },
    },
    isSelected: {
      control: 'boolean',
      description:
        'Active state — inferred from the group value when omitted. Drives `aria-pressed`.',
      table: { category: 'Behavior' },
    },
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description:
        'Active-state color — resolves against `theme.palette`. Inherited from the group.',
      table: { category: 'Visual', defaultValue: { summary: 'default' } },
    },
    size: {
      control: { type: 'select' },
      options: tableSizeTokens,
      description:
        'Padding and font size — resolves against `theme.sizes`. Inherited from the group.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretches the button to fill its container.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button. Inherited from the group.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading indicator and disables the button — e.g. while a toggle saves.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof ToggleButton>

export const Default: Story = {}

function StandaloneToggle() {
  const [isSelected, setIsSelected] = useState(false)
  return (
    <ToggleButton
      value="check"
      isSelected={isSelected}
      onChange={() => setIsSelected((prev) => !prev)}
      aria-label="check"
    >
      <Icon name="check" size="1em" color="inherit" />
    </ToggleButton>
  )
}

export const Standalone: Story = {
  render: () => <StandaloneToggle />,
}
