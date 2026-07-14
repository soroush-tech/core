import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Meta, StoryObj, Decorator } from '@storybook/react-vite'
import { m } from '../utils/test/storiesArgs'
import { checkboxColorTokens, checkboxSizeTokens } from '../utils/test/storiesOptions'
import { ColorSwatchRows, WithCheckedState, type ControlledArgs } from '../utils/test/storiesToggle'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { Checkbox } from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Theme/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'checked',
        'disabled',
        'indeterminate',
        'color',
        'size',
        'fullWidth',
        'children',
        'm',
      ],
    },
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlled checked state.',
      table: { category: 'State' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the checkbox.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Shows the indeterminate (dash) state. Takes priority over `checked`.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: checkboxColorTokens,
      description:
        'Stroke/fill color. `"default"` resolves to `theme.text.secondary`; others to `theme.palette[color].main`.',
      table: { category: 'Visual', defaultValue: { summary: 'default' } },
    },
    size: {
      control: { type: 'inline-radio' },
      options: checkboxSizeTokens,
      description: 'Icon size.',
      table: { category: 'Visual', defaultValue: { summary: 'md' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretches the root to `width: 100%`.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    children: {
      control: 'text',
      description: 'Label text rendered next to the checkbox.',
      table: { category: 'Content' },
    },
    m,
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: { color: 'default', size: 'md', 'aria-label': 'Checkbox' },
}

export const Checked: Story = {
  args: { checked: true, color: 'primary', 'aria-label': 'Checkbox' },
  render: (args) => <Checkbox {...args} onChange={() => {}} />,
}

export const Indeterminate: Story = {
  args: { indeterminate: true, color: 'primary', 'aria-label': 'Checkbox' },
}

export const WithLabel: Story = {
  args: { children: 'Accept terms and conditions', color: 'primary' },
}

export const States: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2}>
      {(
        [
          { label: 'Unchecked', props: {} },
          { label: 'Checked', props: { checked: true, onChange: () => {} } },
          { label: 'Indeterminate', props: { indeterminate: true } },
          { label: 'Disabled unchecked', props: { disabled: true } },
          {
            label: 'Disabled checked',
            props: { disabled: true, checked: true, onChange: () => {} },
          },
          { label: 'Disabled indeterminate', props: { disabled: true, indeterminate: true } },
        ] as const
      ).map(({ label, props }) => (
        <Flex key={label} flexDirection="row" alignItems="center" gap={2}>
          <Typography variant="caption" color="secondary" width="10rem" flexShrink={0} m={0}>
            {label}
          </Typography>
          <Checkbox color="primary" {...props}>
            {label}
          </Checkbox>
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
          <Checkbox color={color} aria-label={`${color} unchecked`} />
          <Checkbox color={color} checked onChange={() => {}} aria-label={`${color} checked`} />
          <Checkbox color={color} indeterminate aria-label={`${color} indeterminate`} />
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
          <Checkbox size={size} color="primary" checked onChange={() => {}} aria-label={size} />
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
      <Checkbox
        color="primary"
        icon={<span style={{ fontSize: '1.2em' }}>☆</span>}
        checkedIcon={<span style={{ fontSize: '1.2em' }}>★</span>}
      >
        Custom star icons (unchecked)
      </Checkbox>
      <Checkbox
        color="primary"
        checked
        onChange={() => {}}
        icon={<span style={{ fontSize: '1.2em' }}>☆</span>}
        checkedIcon={<span style={{ fontSize: '1.2em' }}>★</span>}
      >
        Custom star icons (checked)
      </Checkbox>
    </Flex>
  ),
}

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Mango', 'Strawberry']

interface SelectAllArgs {
  checked: Record<string, boolean>
  setChecked: Dispatch<SetStateAction<Record<string, boolean>>>
}

// Owns the per-item checked map in a decorator and injects it (plus its setter) via args.
const WithSelectAllState: Decorator = (Story, ctx) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(FRUITS.map((f, i) => [f, i < 2]))
  )
  return <Story args={{ ...ctx.args, checked, setChecked }} />
}

export const SelectAll: StoryObj<SelectAllArgs> = {
  decorators: [WithSelectAllState],
  render: ({ checked, setChecked }) => {
    const checkedCount = Object.values(checked).filter(Boolean).length
    const allChecked = checkedCount === FRUITS.length
    const someChecked = checkedCount > 0 && !allChecked

    const toggleAll = () => {
      const next = !allChecked
      setChecked(Object.fromEntries(FRUITS.map((f) => [f, next])))
    }

    return (
      <Flex flexDirection="column" gap={1}>
        <Checkbox
          color="primary"
          checked={allChecked}
          indeterminate={someChecked}
          onChange={toggleAll}
        >
          <Typography variant="body2" m={0}>
            Select all
          </Typography>
        </Checkbox>
        <Flex flexDirection="column" gap={1} ml={4}>
          {FRUITS.map((fruit) => (
            <Checkbox
              key={fruit}
              color="primary"
              checked={checked[fruit]}
              onChange={(e) => setChecked((prev) => ({ ...prev, [fruit]: e.target.checked }))}
            >
              <Typography variant="body2" m={0}>
                {fruit}
              </Typography>
            </Checkbox>
          ))}
        </Flex>
        <Typography variant="caption" color="secondary" mt={1} mb={0}>
          {checkedCount} of {FRUITS.length} selected
        </Typography>
      </Flex>
    )
  },
}

export const Controlled: StoryObj<ControlledArgs> = {
  decorators: [WithCheckedState],
  render: ({ checked, onChange }) => (
    <Flex flexDirection="column" gap={2}>
      <Checkbox color="primary" checked={checked} onChange={onChange}>
        {checked ? 'Checked' : 'Unchecked'} — click to toggle
      </Checkbox>
      <Typography variant="caption" color="secondary" m={0}>
        State: {String(checked)}
      </Typography>
    </Flex>
  ),
}
