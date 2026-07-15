import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  asTokens,
  buttonColorTokens,
  textColorTokens,
  textInputSizeTokens,
} from '../utils/test/storiesOptions'
import { Paper } from '../Paper'
import { MenuItem } from './MenuItem'

const meta: Meta<typeof MenuItem> = {
  title: 'Theme/MenuItem',
  component: MenuItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'value',
        'children',
        'disabled',
        'selected',
        'highlighted',
        'multiple',
        'color',
        'textColor',
        'size',
        'dense',
        'disableGutters',
        'divider',
        'autoFocus',
        'as',
      ],
    },
  },
  args: {
    value: 'web',
    children: 'Web',
    color: 'primary',
    size: 'md',
  },
  argTypes: {
    value: {
      control: 'text',
      description: "The value this option represents — reported to Select's onChange.",
      table: { category: 'Content' },
    },
    children: {
      control: 'text',
      description: 'The option label.',
      table: { category: 'Content' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the option.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    selected: {
      control: 'boolean',
      description: 'Marks the option as selected. Injected by Select.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    highlighted: {
      control: 'boolean',
      description: 'Marks the option as keyboard-highlighted. Injected by Select.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    multiple: {
      control: 'boolean',
      description: 'Reserves a leading checkmark slot. Injected by Select.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description: 'Accent color — resolves to `theme.palette[color]`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    textColor: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Base text color of the row — resolves against `theme.text`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: { type: 'select' },
      options: textInputSizeTokens,
      description: 'Density — resolves against `theme.sizes`.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    dense: {
      control: 'boolean',
      description: 'Compact vertical padding, independent of `size`.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    disableGutters: {
      control: 'boolean',
      description: 'Remove the left and right padding.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    divider: {
      control: 'boolean',
      description: 'Add a 1px bottom border to separate the row.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    autoFocus: {
      control: 'boolean',
      description: 'Focus the row on first mount (and when it flips false → true).',
      table: { category: 'Focus', defaultValue: { summary: 'false' } },
    },
    as: {
      control: { type: 'select' },
      options: asTokens,
      description: 'The element used for the root node.',
      table: { category: 'Layout', defaultValue: { summary: 'li' } },
    },
  },
  decorators: [
    (Story) => (
      <Paper elevation={8} p={0} borderRadius="sm" style={{ width: 220 }}>
        <ul style={{ margin: 0, padding: '0.25rem 0', listStyle: 'none' }}>
          <Story />
        </ul>
      </Paper>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MenuItem>

export const Default: Story = {}

export const Selected: Story = {
  args: { selected: true },
}

export const States: Story = {
  render: () => (
    <>
      <MenuItem value="a">Default</MenuItem>
      <MenuItem value="b" highlighted>
        Highlighted
      </MenuItem>
      <MenuItem value="c" selected>
        Selected
      </MenuItem>
      <MenuItem value="d" disabled>
        Disabled
      </MenuItem>
    </>
  ),
}

export const MultipleWithCheckmark: Story = {
  render: () => (
    <>
      <MenuItem value="a" multiple selected>
        Selected
      </MenuItem>
      <MenuItem value="b" multiple>
        Unselected
      </MenuItem>
    </>
  ),
}

export const DividersAndDense: Story = {
  render: () => (
    <>
      <MenuItem value="a" divider>
        Profile
      </MenuItem>
      <MenuItem value="b" divider>
        Settings
      </MenuItem>
      <MenuItem value="c" dense>
        Compact row
      </MenuItem>
      <MenuItem value="d" dense>
        Another compact row
      </MenuItem>
    </>
  ),
}
