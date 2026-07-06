import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  buttonColorTokens,
  buttonVariantTokens,
  buttonSizeTokens,
  borderRadiiTokens,
} from 'src/theme/utils/test/storiesOptions'
import { Flex } from 'src/theme/Flex'
import { Button } from 'src/theme/Button'
import { ButtonGroup } from './ButtonGroup'

const meta: Meta<typeof ButtonGroup> = {
  title: 'Theme/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'color', 'size', 'orientation', 'borderRadius', 'disabled', 'fullWidth'],
    },
  },
  args: {
    'aria-label': 'Basic button group',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: buttonVariantTokens,
      description: 'Visual style for all child buttons.',
      table: { category: 'Visual', defaultValue: { summary: 'outlined' } },
    },
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description: 'Color palette for all child buttons — resolves against `theme.palette`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: { type: 'select' },
      options: buttonSizeTokens,
      description: 'Density for all child buttons — resolves against `theme.sizes`.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Layout flow direction.',
      table: { category: 'Layout', defaultValue: { summary: 'horizontal' } },
    },
    borderRadius: {
      control: { type: 'select' },
      options: borderRadiiTokens,
      description: "Group corner radius — rounds the group's outer corners only.",
      table: { category: 'Visual', defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all child buttons.',
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
type Story = StoryObj<typeof ButtonGroup>

// ButtonGroup accepts multiple children directly — no fragment wrapper needed.
const buttons = [
  <Button key="one">One</Button>,
  <Button key="two">Two</Button>,
  <Button key="three">Three</Button>,
]

export const Default: Story = {
  render: (args) => <ButtonGroup {...args}>{buttons}</ButtonGroup>,
}

export const Variants: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3} alignItems="center">
      {(['contained', 'outlined', 'text'] as const).map((variant) => (
        <ButtonGroup key={variant} variant={variant} aria-label={`${variant} button group`}>
          {buttons}
        </ButtonGroup>
      ))}
    </Flex>
  ),
}

export const SizesAndColors: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3} alignItems="center">
      <ButtonGroup size="sm" aria-label="Small button group">
        {buttons}
      </ButtonGroup>
      <ButtonGroup color="secondary" aria-label="Medium-sized button group">
        {buttons}
      </ButtonGroup>
      <ButtonGroup size="lg" aria-label="Large button group">
        {buttons}
      </ButtonGroup>
    </Flex>
  ),
}

export const Radii: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3} alignItems="center">
      {borderRadiiTokens.map((radius) => (
        <ButtonGroup
          key={radius}
          borderRadius={radius}
          aria-label={`${radius} radius button group`}
        >
          {buttons}
        </ButtonGroup>
      ))}
    </Flex>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" aria-label="Vertical button group">
      {buttons}
    </ButtonGroup>
  ),
}

export const FullWidth: Story = {
  render: () => (
    <ButtonGroup fullWidth aria-label="Full-width button group" style={{ minWidth: '480px' }}>
      {buttons}
    </ButtonGroup>
  ),
}
