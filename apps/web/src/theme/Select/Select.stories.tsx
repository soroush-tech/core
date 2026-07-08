import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { m, p, width, minWidth, maxWidth } from 'src/theme/utils/test/storiesArgs'
import {
  backgroundTokens,
  borderRadiiTokens,
  selectColorTokens,
  selectVariantTokens,
  selectSizeTokens,
  textColorTokens,
} from 'src/theme/utils/test/storiesOptions'
import { Flex } from 'src/theme/Flex'
import { Typography } from 'src/theme/Typography'
import { MenuItem } from 'src/theme/MenuItem'
import { Select, type SelectProps, type SelectValue } from './Select'

const platformItems = [
  <MenuItem key="web" value="web">
    Web
  </MenuItem>,
  <MenuItem key="android" value="android">
    Android
  </MenuItem>,
  <MenuItem key="ios" value="ios">
    iOS
  </MenuItem>,
  <MenuItem key="desktop" value="desktop" disabled>
    Desktop (soon)
  </MenuItem>,
]

const meta: Meta<typeof Select> = {
  title: 'Theme/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'native',
        'multiple',
        'autoWidth',
        'variant',
        'color',
        'textColor',
        'bg',
        'size',
        'borderRadius',
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
    children: platformItems,
    placeholder: 'Pick a platform',
    variant: 'outlined',
  },
  argTypes: {
    native: {
      control: 'boolean',
      description: 'Render a native `<select>` (single-select) instead of the custom listbox.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow selecting several options. Ignored on the native path.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    autoWidth: {
      control: 'boolean',
      description:
        'Size the trigger to the current selection. When `false` (default) it reserves the widest option’s width, avoiding layout shift on selection.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    variant: {
      control: { type: 'select' },
      options: selectVariantTokens,
      description:
        '`outlined`/`default` — full border box · `underline` — bottom border only · `text` — no border.',
      table: { category: 'Visual', defaultValue: { summary: 'default' } },
    },
    color: {
      control: { type: 'select' },
      options: selectColorTokens,
      description: 'Focus/active border color — resolves to `theme.palette[color]`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    textColor: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Text color of the trigger value — resolves against `theme.text`.',
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
      options: selectSizeTokens,
      description: 'Controls padding and font size — resolves against `theme.sizes`.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    borderRadius: {
      control: { type: 'select' },
      options: borderRadiiTokens,
      description:
        'Corner radius — applies only to `default`/`outlined` variants. Resolves against `theme.radii`.',
      table: { category: 'Layout' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the select.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'boolean',
      description: 'Marks the field as invalid — applies the error border color.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretches the trigger to fill its container.',
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
type Story = StoryObj<typeof Select>

export const Default: Story = {}

export const Native: Story = {
  args: { native: true },
}

export const Variants: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['outlined', 'default', 'underline', 'text'] as const).map((variant) => (
        <Select key={variant} variant={variant} placeholder={variant}>
          {platformItems}
        </Select>
      ))}
    </Flex>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Flex gap={3} alignItems="center">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Select key={size} size={size} variant="outlined" placeholder={size}>
          {platformItems}
        </Select>
      ))}
    </Flex>
  ),
}

export const ErrorState: Story = {
  args: { error: true },
}

export const WithDividers: Story = {
  args: {
    placeholder: 'Pick a platform',
    children: [
      <MenuItem key="web" value="web" divider>
        Web
      </MenuItem>,
      <MenuItem key="android" value="android" divider>
        Android
      </MenuItem>,
      <MenuItem key="ios" value="ios">
        iOS
      </MenuItem>,
    ],
  },
}

function ControlledSelect(props: Readonly<Partial<SelectProps>>) {
  const [value, setValue] = useState<SelectValue>('web')
  return (
    <Flex flexDirection="column" gap={2} style={{ maxWidth: 240 }}>
      <Typography variant="caption" color="secondary">
        Selected: {String(value)}
      </Typography>
      <Select variant="outlined" value={value} onChange={setValue} {...props}>
        {platformItems}
      </Select>
    </Flex>
  )
}

export const Controlled: Story = {
  render: () => <ControlledSelect />,
}

function MultiSelect() {
  const [value, setValue] = useState<SelectValue>(['web', 'ios'])
  return (
    <Flex flexDirection="column" gap={2}>
      <Typography variant="caption" color="secondary">
        Selected: {Array.isArray(value) ? value.join(', ') || 'none' : value}
      </Typography>
      <Select
        multiple
        variant="outlined"
        placeholder="Pick platforms"
        value={value}
        onChange={setValue}
      >
        {platformItems}
      </Select>
    </Flex>
  )
}

export const Multiple: Story = {
  render: () => <MultiSelect />,
}
