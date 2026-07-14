import type { Meta, StoryObj } from '@storybook/react-vite'
import { m } from '../utils/test/storiesArgs'
import {
  circularProgressColorTokens,
  circularProgressEasingTokens,
  circularProgressVariantTokens,
} from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { CircularProgress } from './CircularProgress'

const meta: Meta<typeof CircularProgress> = {
  title: 'Theme/CircularProgress',
  component: CircularProgress,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'variant',
        'color',
        'size',
        'thickness',
        'value',
        'min',
        'max',
        'disableShrink',
        'spinning',
        'easing',
        'showTrack',
        'm',
      ],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: circularProgressVariantTokens,
      description: 'Visual variant — looping animation or value-driven arc.',
      table: { category: 'Visual', defaultValue: { summary: 'indeterminate' } },
    },
    color: {
      control: { type: 'select' },
      options: circularProgressColorTokens,
      description:
        'Stroke color — resolves to `theme.palette[color].main`; `"inherit"` uses `currentColor`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: { type: 'number' },
      description: 'Width and height in px (number) or raw CSS unit (string).',
      table: { category: 'Visual', defaultValue: { summary: '40' } },
    },
    thickness: {
      control: { type: 'number', min: 1, max: 10, step: 0.2 },
      description: 'SVG stroke width in viewBox user units.',
      table: { category: 'Visual', defaultValue: { summary: '3.6' } },
    },
    value: {
      control: { type: 'number' },
      description: 'Progress value for the `"determinate"` variant (clamped between min and max).',
      table: { category: 'Progress' },
    },
    min: {
      control: { type: 'number' },
      description: 'Minimum value for the `"determinate"` variant.',
      table: { category: 'Progress', defaultValue: { summary: '0' } },
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value for the `"determinate"` variant.',
      table: { category: 'Progress', defaultValue: { summary: '100' } },
    },
    disableShrink: {
      control: 'boolean',
      description: 'Disables the stroke shrink/expand keyframe animation (`"indeterminate"` only).',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    spinning: {
      control: 'boolean',
      description:
        'Applies rotation animation to `"determinate"` — arc length reflects `value` while the spinner still rotates.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    easing: {
      control: { type: 'inline-radio' },
      options: circularProgressEasingTokens,
      description: 'Timing function for the rotation animation.',
      table: { category: 'Visual', defaultValue: { summary: 'linear' } },
    },
    showTrack: {
      control: 'boolean',
      description: 'Renders a faint full-ring track behind the progress arc.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    m,
  },
}

export default meta
type Story = StoryObj<typeof CircularProgress>

export const Default: Story = {
  args: {
    variant: 'indeterminate',
    color: 'primary',
    size: 40,
  },
}

export const Determinate: Story = {
  args: {
    variant: 'determinate',
    value: 70,
    color: 'primary',
    size: 40,
  },
}

export const SpinningDeterminate: Story = {
  render: () => (
    <Flex flexDirection="row" gap={4} alignItems="center">
      {([25, 50, 75] as const).map((value) => (
        <Flex key={value} flexDirection="column" alignItems="center" gap={1}>
          <CircularProgress variant="determinate" value={value} spinning size={48} />
          <Typography variant="caption" color="secondary" m={0}>
            {value}%
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const Colors: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const).map((color) => (
        <Flex key={color} flexDirection="row" gap={2} alignItems="center">
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {color}
          </Typography>
          <CircularProgress showTrack color={color} size={32} />
          <CircularProgress showTrack variant="determinate" value={65} color={color} size={32} />
        </Flex>
      ))}
    </Flex>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Flex flexDirection="row" gap={3} alignItems="end" flexWrap="wrap">
      {([16, 24, 40, 64, 80] as const).map((size) => (
        <Flex key={size} flexDirection="column" alignItems="center" gap={1}>
          <CircularProgress size={size} />
          <Typography variant="caption" color="secondary" m={0}>
            {size}px
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const Thickness: Story = {
  render: () => (
    <Flex flexDirection="row" gap={3} alignItems="center" flexWrap="wrap">
      {([1, 2, 3.6, 6, 10] as const).map((thickness) => (
        <Flex key={thickness} flexDirection="column" alignItems="center" gap={1}>
          <CircularProgress thickness={thickness} size={48} />
          <Typography variant="caption" color="secondary" m={0}>
            {thickness}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const ShowTrack: Story = {
  render: () => (
    <Flex flexDirection="row" gap={4} alignItems="center" flexWrap="wrap">
      <Flex flexDirection="column" alignItems="center" gap={1}>
        <CircularProgress showTrack size={48} />
        <Typography variant="caption" color="secondary" m={0}>
          indeterminate
        </Typography>
      </Flex>
      <Flex flexDirection="column" alignItems="center" gap={1}>
        <CircularProgress variant="determinate" value={65} showTrack size={48} />
        <Typography variant="caption" color="secondary" m={0}>
          determinate 65%
        </Typography>
      </Flex>
    </Flex>
  ),
}

export const Easing: Story = {
  render: () => (
    <Flex flexDirection="row" gap={4} alignItems="center" flexWrap="wrap">
      {(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'] as const).map((easing) => (
        <Flex key={easing} flexDirection="column" alignItems="center" gap={1}>
          <CircularProgress easing={easing} size={48} />
          <Typography variant="caption" color="secondary" m={0}>
            {easing}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const CustomRange: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(
        [
          { value: 3, min: 0, max: 10, label: '3 of 10' },
          { value: 120, min: 0, max: 200, label: '120 of 200' },
          { value: 7, min: 5, max: 15, label: '7 of 5–15' },
        ] as const
      ).map(({ value, min, max, label }) => (
        <Flex key={label} flexDirection="row" gap={2} alignItems="center">
          <CircularProgress
            variant="determinate"
            value={value}
            min={min}
            max={max}
            showTrack
            size={48}
          />
          <Typography variant="caption" color="secondary" m={0}>
            {label}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const SpinningWithTrack: Story = {
  render: () => (
    <Flex flexDirection="row" gap={4} alignItems="center" flexWrap="wrap">
      {([25, 50, 75, 90] as const).map((value) => (
        <Flex key={value} flexDirection="column" alignItems="center" gap={1}>
          <CircularProgress
            variant="determinate"
            value={value}
            spinning
            showTrack
            size={56}
            thickness={5}
          />
          <Typography variant="caption" color="secondary" m={0}>
            {value}%
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const DisableShrink: Story = {
  render: () => (
    <Flex flexDirection="row" gap={4} alignItems="center">
      <Flex flexDirection="column" alignItems="center" gap={1}>
        <CircularProgress />
        <Typography variant="caption" color="secondary" m={0}>
          default
        </Typography>
      </Flex>
      <Flex flexDirection="column" alignItems="center" gap={1}>
        <CircularProgress disableShrink />
        <Typography variant="caption" color="secondary" m={0}>
          disableShrink
        </Typography>
      </Flex>
    </Flex>
  ),
}
