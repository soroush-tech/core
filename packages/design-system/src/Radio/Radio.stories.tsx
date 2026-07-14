import { useState } from 'react'
import type { Meta, StoryObj, Decorator } from '@storybook/react-vite'
import { m } from '../utils/test/storiesArgs'
import { radioColorTokens, radioSizeTokens } from '../utils/test/storiesOptions'
import { ColorSwatchRows, WithCheckedState, type ControlledArgs } from '../utils/test/storiesToggle'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { Radio } from './Radio'

const meta: Meta<typeof Radio> = {
  title: 'Theme/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['checked', 'disabled', 'color', 'size', 'children', 'm'],
    },
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlled checked state. Must be paired with `onChange`.',
      table: { category: 'State' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the radio.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: radioColorTokens,
      description:
        'Stroke/fill color. `"default"` resolves to `theme.text.secondary`; others to `theme.palette[color].main`.',
      table: { category: 'Visual', defaultValue: { summary: 'default' } },
    },
    size: {
      control: { type: 'inline-radio' },
      options: radioSizeTokens,
      description: 'Icon size.',
      table: { category: 'Visual', defaultValue: { summary: 'md' } },
    },
    children: {
      control: 'text',
      description: 'Label text rendered next to the radio.',
      table: { category: 'Content' },
    },
    m,
  },
}

export default meta
type Story = StoryObj<typeof Radio>

export const Default: Story = {
  args: { color: 'default', size: 'md' },
}

export const Checked: Story = {
  args: { checked: true, color: 'primary' },
  render: (args) => <Radio {...args} onChange={() => {}} />,
}

export const WithLabel: Story = {
  args: { children: 'Option A', color: 'primary' },
}

export const States: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2}>
      {(
        [
          { label: 'Unchecked', props: {} },
          { label: 'Checked', props: { checked: true, onChange: () => {} } },
          { label: 'Disabled unchecked', props: { disabled: true } },
          {
            label: 'Disabled checked',
            props: { disabled: true, checked: true, onChange: () => {} },
          },
        ] as const
      ).map(({ label, props }) => (
        <Flex key={label} flexDirection="row" alignItems="center" gap={2}>
          <Typography variant="caption" color="secondary" width="10rem" flexShrink={0} m={0}>
            {label}
          </Typography>
          <Radio color="primary" {...props} />
        </Flex>
      ))}
    </Flex>
  ),
}

export const Colors: Story = {
  render: () => (
    <ColorSwatchRows
      controls={(color) => (
        <>
          <Radio color={color} />
          <Radio color={color} checked onChange={() => {}} />
        </>
      )}
    />
  ),
}

export const Sizes: Story = {
  render: () => (
    <Flex flexDirection="row" gap={4} alignItems="center">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Flex key={size} flexDirection="column" alignItems="center" gap={1}>
          <Radio size={size} color="primary" checked onChange={() => {}} />
          <Typography variant="caption" color="secondary" m={0}>
            {size}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const CustomIcons: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2}>
      <Radio
        color="primary"
        icon={<span style={{ fontSize: '1.2em' }}>○</span>}
        checkedIcon={<span style={{ fontSize: '1.2em' }}>●</span>}
      >
        Custom icons (unchecked)
      </Radio>
      <Radio
        color="primary"
        checked
        onChange={() => {}}
        icon={<span style={{ fontSize: '1.2em' }}>○</span>}
        checkedIcon={<span style={{ fontSize: '1.2em' }}>●</span>}
      >
        Custom icons (checked)
      </Radio>
    </Flex>
  ),
}

interface GroupArgs {
  selected: string
  setSelected: (value: string) => void
}

// Owns the selected-value state in a decorator and injects it (plus its setter) via args.
const WithRadioGroupState: Decorator = (Story, ctx) => {
  const [selected, setSelected] = useState('b')
  return <Story args={{ ...ctx.args, selected, setSelected }} />
}

export const Group: StoryObj<GroupArgs> = {
  decorators: [WithRadioGroupState],
  render: ({ selected, setSelected }) => (
    <Flex flexDirection="column" gap={1}>
      {(['a', 'b', 'c'] as const).map((v) => (
        <Radio
          key={v}
          color="primary"
          name="demo"
          value={v}
          checked={selected === v}
          onChange={() => setSelected(v)}
        >
          Option {v.toUpperCase()}
        </Radio>
      ))}
      <Typography variant="caption" color="secondary" mt={1} mb={0}>
        Selected: {selected}
      </Typography>
    </Flex>
  ),
}

export const Controlled: StoryObj<ControlledArgs> = {
  decorators: [WithCheckedState],
  render: ({ checked, onChange }) => (
    <Flex flexDirection="column" gap={2}>
      <Radio color="primary" checked={checked} onChange={onChange}>
        {checked ? 'Selected' : 'Unselected'} — click to toggle
      </Radio>
      <Typography variant="caption" color="secondary" m={0}>
        State: {String(checked)}
      </Typography>
    </Flex>
  ),
}
