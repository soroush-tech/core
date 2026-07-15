import { useState, type ChangeEvent } from 'react'
import type { Meta, StoryObj, Decorator } from '@storybook/react-vite'
import { m } from '../utils/test/storiesArgs'
import {
  backgroundTokens,
  switchColorTokens,
  switchEdgeTokens,
  switchSizeTokens,
  switchVariantTokens,
} from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { Switch } from './Switch'
import { Paper } from '../Paper'

const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="0.6em"
    height="0.6em"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

const MoonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="0.6em"
    height="0.6em"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const meta: Meta<typeof Switch> = {
  title: 'Theme/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'checked',
        'disabled',
        'color',
        'bg',
        'size',
        'variant',
        'marked',
        'edge',
        'children',
        'm',
      ],
    },
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlled checked state.',
      table: { category: 'Visual' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the switch.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: switchColorTokens,
      description:
        'Track and thumb color when checked. Resolves to `theme.palette[color].dark` for the track and `theme.palette[color].main` for the thumb.',
      table: { category: 'Visual', defaultValue: { summary: 'default' } },
    },
    bg: {
      control: { type: 'select' },
      options: backgroundTokens,
      description:
        'Track background color in the unchecked state. Uses `theme.background` tokens. Defaults to `theme.background.primary` when not set.',
      table: { category: 'Visual' },
    },
    size: {
      control: { type: 'inline-radio' },
      options: switchSizeTokens,
      description: 'Track and thumb size. Applies to both `"outside"` and `"inside"` variants.',
      table: { category: 'Visual', defaultValue: { summary: 'md' } },
    },
    variant: {
      control: { type: 'inline-radio' },
      options: switchVariantTokens,
      description:
        '`"outside"` — thumb overflows the track vertically (MUI-style). `"inside"` — thumb is contained within the track (iOS-style). The `size` prop works for both.',
      table: { category: 'Visual', defaultValue: { summary: 'outside' } },
    },
    marked: {
      control: 'boolean',
      description:
        'Shows ✓/✕ indicators. For `"outside"`, SVG icons appear inside the thumb. For `"inside"`, marks appear as CSS pseudo-elements in the track.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    edge: {
      control: { type: 'inline-radio' },
      options: switchEdgeTokens,
      description:
        'Applies a negative margin to counteract root padding on the given side. Useful when the switch sits at the edge of a layout.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    children: {
      control: 'text',
      description: 'Label text rendered next to the switch.',
      table: { category: 'Content' },
    },
    m,
  },
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: { color: 'default', size: 'md', variant: 'outside', 'aria-label': 'Toggle' },
}

export const Colors: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2}>
      {switchColorTokens.map((color) => (
        <Flex key={color} flexDirection="row" alignItems="center" gap={3}>
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {color}
          </Typography>
          <Switch color={color} aria-label={`${color} off`} />
          <Switch color={color} checked onChange={() => {}} aria-label={`${color} on`} />
        </Flex>
      ))}
    </Flex>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['outside', 'inside'] as const).map((variant) => (
        <Flex key={variant} flexDirection="row" gap={4} alignItems="center">
          <Typography variant="caption" color="secondary" width="5rem" flexShrink={0} m={0}>
            {variant}
          </Typography>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Flex key={size} flexDirection="column" alignItems="center" gap={1}>
              <Switch
                variant={variant}
                size={size}
                color="primary"
                checked
                onChange={() => {}}
                aria-label={`${variant} ${size}`}
              />
              <Typography variant="caption" color="secondary" m={0}>
                {size}
              </Typography>
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2}>
      {(
        [
          { label: 'Disabled off', props: { disabled: true } },
          { label: 'Disabled on', props: { disabled: true, checked: true, onChange: () => {} } },
        ] as const
      ).map(({ label, props }) => (
        <Flex key={label} flexDirection="row" alignItems="center" gap={2}>
          <Typography variant="caption" color="secondary" width="8rem" flexShrink={0} m={0}>
            {label}
          </Typography>
          <Switch color="primary" {...props} aria-label={label} />
        </Flex>
      ))}
    </Flex>
  ),
}

interface ControlledArgs {
  checked: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

// Owns the checked state in a decorator and injects checked + onChange via args.
const WithSwitchState: Decorator = (Story, ctx) => {
  const [checked, setChecked] = useState(false)
  return (
    <Story
      args={{
        ...ctx.args,
        checked,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked),
      }}
    />
  )
}

export const Controlled: StoryObj<ControlledArgs> = {
  decorators: [WithSwitchState],
  render: ({ checked, onChange }) => (
    <Flex flexDirection="column" gap={2}>
      <Switch color="primary" checked={checked} onChange={onChange}>
        {checked ? 'On' : 'Off'} — click to toggle
      </Switch>
      <Typography variant="caption" color="secondary" m={0}>
        State: {String(checked)}
      </Typography>
    </Flex>
  ),
}

export const WithLabel: Story = {
  args: { children: 'Enable dark mode', color: 'primary' },
}

export const Variants: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['outside', 'inside'] as const).map((variant) => (
        <Flex key={variant} flexDirection="row" alignItems="center" gap={3}>
          <Typography variant="caption" color="secondary" width="5rem" flexShrink={0} m={0}>
            {variant}
          </Typography>
          <Switch variant={variant} color="primary" aria-label={`${variant} off`} />
          <Switch
            variant={variant}
            color="primary"
            checked
            onChange={() => {}}
            aria-label={`${variant} on`}
          />
        </Flex>
      ))}
    </Flex>
  ),
}

export const Marked: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['outside', 'inside'] as const).map((variant) => (
        <Flex key={variant} flexDirection="row" alignItems="center" gap={3}>
          <Typography variant="caption" color="secondary" width="5rem" flexShrink={0} m={0}>
            {variant}
          </Typography>
          <Switch variant={variant} marked color="primary" aria-label={`${variant} marked off`} />
          <Switch
            variant={variant}
            marked
            color="primary"
            checked
            onChange={() => {}}
            aria-label={`${variant} marked on`}
          />
        </Flex>
      ))}
    </Flex>
  ),
}

export const WithIcons: Story = {
  decorators: [WithSwitchState],
  render: ({ checked, onChange, ...props }) => (
    <Paper p={2}>
      <Flex flexDirection="column" gap={3}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Flex key={size} flexDirection="row" alignItems="center" gap={3}>
            <Typography variant="caption" color="secondary" width="3rem" flexShrink={0} m={0}>
              {size}
            </Typography>
            <Switch
              size={size}
              variant="outside"
              color="primary"
              {...props}
              checked={checked}
              onChange={onChange}
              icon={<MoonIcon />}
              checkedIcon={<SunIcon />}
              aria-label={`outside ${size} theme toggle`}
            />
            <Switch
              variant="inside"
              size={size}
              color="primary"
              {...props}
              checked={checked}
              onChange={onChange}
              icon={<MoonIcon />}
              checkedIcon={<SunIcon />}
              aria-label={`inside ${size} theme toggle`}
            />
          </Flex>
        ))}
      </Flex>
    </Paper>
  ),
}
