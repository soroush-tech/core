import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { m, p, width, minWidth, maxWidth } from 'src/theme/utils/test/storiesArgs'
import {
  backgroundTokens,
  textInputColorTokens,
  textInputVariantTokens,
  textInputSizeTokens,
  textColorTokens,
} from 'src/theme/utils/test/storiesOptions'
import { Flex } from 'src/theme/Flex'
import { Typography } from 'src/theme/Typography'
import { NativeSelect, type NativeSelectProps } from './NativeSelect'

const platformOptions = [
  { label: 'Web', value: 'web' },
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
]

const rowsOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

const meta: Meta<typeof NativeSelect> = {
  title: 'Theme/NativeSelect',
  component: NativeSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'variant',
        'color',
        'textColor',
        'bg',
        'size',
        'disabled',
        'error',
        'required',
        'fullWidth',
        'placeholder',
        'iconName',
        'p',
        'm',
        'width',
        'minWidth',
        'maxWidth',
      ],
    },
  },
  args: {
    options: platformOptions,
    placeholder: 'Pick a platform',
    variant: 'outlined',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: textInputVariantTokens,
      description:
        '`outlined`/`default` — full border box · `underline` — bottom border only · `text` — no border.',
      table: { category: 'Visual', defaultValue: { summary: 'default' } },
    },
    color: {
      control: { type: 'select' },
      options: textInputColorTokens,
      description: 'Focus/active border color — resolves to `theme.palette[color]`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    textColor: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Text color of the selected value — resolves against `theme.text`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    bg: {
      control: { type: 'select' },
      options: backgroundTokens,
      description: 'Background color — resolves against `theme.background`.',
      table: { category: 'Visual', defaultValue: { summary: 'terminal' } },
    },
    size: {
      control: { type: 'select' },
      options: textInputSizeTokens,
      description: 'Controls padding and font size — resolves against `theme.sizes`.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the select.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'boolean',
      description: 'Marks the field as invalid — applies error border color.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the native select as required.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretches the root to fill its container.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Empty-state label shown while nothing is selected.',
      table: { category: 'Content' },
    },
    iconName: {
      control: 'text',
      description: 'Dropdown affordance icon from the Icon registry.',
      table: { category: 'Visual', defaultValue: { summary: 'expand_more' } },
    },
    p,
    m,
    width,
    minWidth,
    maxWidth,
  },
}

export default meta
type Story = StoryObj<typeof NativeSelect>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['outlined', 'default', 'underline', 'text'] as const).map((variant) => (
        <NativeSelect
          key={variant}
          variant={variant}
          options={platformOptions}
          placeholder={variant}
        />
      ))}
    </Flex>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Flex gap={3} alignItems="center">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <NativeSelect
          key={size}
          size={size}
          variant="outlined"
          options={platformOptions}
          placeholder={size}
        />
      ))}
    </Flex>
  ),
}

export const ErrorState: Story = {
  args: { error: true },
}

function ControlledNativeSelect(props: Readonly<Partial<NativeSelectProps>>) {
  const [rowsPerPage, setRowsPerPage] = useState<string | number>(25)
  return (
    <Flex flexDirection="column" gap={2}>
      <Typography variant="caption" color="secondary">
        Rows per page: {rowsPerPage}
      </Typography>
      <NativeSelect
        variant="outlined"
        options={rowsOptions}
        value={rowsPerPage}
        onChange={setRowsPerPage}
        {...props}
      />
    </Flex>
  )
}

export const Controlled: Story = {
  render: () => <ControlledNativeSelect />,
}
