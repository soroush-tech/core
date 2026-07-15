import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { buttonColorTokens, tableSizeTokens } from '../../utils/test/storiesOptions'
import { Flex } from '../../Flex'
import { ToggleButton } from '../ToggleButton'
import { ToggleButtonGroup, type ToggleButtonGroupProps } from './ToggleButtonGroup'
import { type ToggleButtonValue } from '../ToggleButtonGroupContext'

const meta: Meta<typeof ToggleButtonGroup> = {
  title: 'Theme/ToggleButton/ToggleButtonGroup',
  component: ToggleButtonGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['isExclusive', 'color', 'size', 'orientation', 'disabled', 'fullWidth'],
    },
  },
  argTypes: {
    isExclusive: {
      control: 'boolean',
      description: 'Only one child value can be selected at a time.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description: 'Selected-state color for all children — resolves against `theme.palette`.',
      table: { category: 'Visual' },
    },
    size: {
      control: { type: 'select' },
      options: tableSizeTokens,
      description: 'Density for all children — resolves against `theme.sizes`.',
      table: { category: 'Layout' },
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Layout flow direction.',
      table: { category: 'Layout', defaultValue: { summary: 'horizontal' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all children.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Group fills its container; children share the width.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof ToggleButtonGroup>

function ExclusiveGroup(props: Readonly<Partial<ToggleButtonGroupProps>>) {
  const [platform, setPlatform] = useState<ToggleButtonValue | ToggleButtonValue[] | null>('web')
  return (
    <ToggleButtonGroup
      isExclusive
      value={platform}
      onChange={setPlatform}
      color="primary"
      aria-label="Platform"
      {...props}
    >
      <ToggleButton value="web">Web</ToggleButton>
      <ToggleButton value="android">Android</ToggleButton>
      <ToggleButton value="ios">iOS</ToggleButton>
    </ToggleButtonGroup>
  )
}

function MultipleGroup(props: Readonly<Partial<ToggleButtonGroupProps>>) {
  const [formats, setFormats] = useState<ToggleButtonValue | ToggleButtonValue[] | null>(['bold'])
  return (
    <ToggleButtonGroup
      value={formats}
      onChange={setFormats}
      color="secondary"
      aria-label="Text formatting"
      {...props}
    >
      <ToggleButton value="bold">Bold</ToggleButton>
      <ToggleButton value="italic">Italic</ToggleButton>
      <ToggleButton value="underline">Underline</ToggleButton>
    </ToggleButtonGroup>
  )
}

export const ExclusiveSelection: Story = {
  render: (args) => <ExclusiveGroup {...args} />,
}

export const MultipleSelection: Story = {
  render: (args) => <MultipleGroup {...args} />,
}

export const Sizes: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3} alignItems="flex-start">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ExclusiveGroup key={size} size={size} />
      ))}
    </Flex>
  ),
}

export const Vertical: Story = {
  render: () => <ExclusiveGroup orientation="vertical" />,
}

export const FullWidth: Story = {
  render: () => <ExclusiveGroup fullWidth />,
}

export const Disabled: Story = {
  render: () => <ExclusiveGroup disabled />,
}
