import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { m } from '../utils/test/storiesArgs'
import {
  linearProgressColorTokens,
  linearProgressEasingTokens,
  linearProgressVariantTokens,
} from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { LinearProgress } from './LinearProgress'

const meta: Meta<typeof LinearProgress> = {
  title: 'Theme/LinearProgress',
  component: LinearProgress,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'variant',
        'color',
        'thickness',
        'value',
        'buffer',
        'valueBuffer',
        'min',
        'max',
        'spinning',
        'easing',
        'showTrack',
        'round',
        'm',
      ],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: linearProgressVariantTokens,
      description: 'Visual variant — looping animation, value-driven bar, or reversed loop.',
      table: { category: 'Visual', defaultValue: { summary: 'indeterminate' } },
    },
    color: {
      control: { type: 'select' },
      options: linearProgressColorTokens,
      description:
        'Bar color — resolves to `theme.palette[color].main`; `"inherit"` uses `currentColor`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    thickness: {
      control: { type: 'number' },
      description: 'Bar height in px (number) or raw CSS unit (string).',
      table: { category: 'Visual', defaultValue: { summary: '4' } },
    },
    value: {
      control: { type: 'number' },
      description: 'Progress value for the `"determinate"` variant (clamped between min and max).',
      table: { category: 'Progress' },
    },
    buffer: {
      control: 'boolean',
      description:
        'Renders a buffer bar driven by `valueBuffer` behind a `"determinate"` bar, with a dotted leading edge.',
      table: { category: 'Progress', defaultValue: { summary: 'false' } },
    },
    valueBuffer: {
      control: { type: 'number' },
      description: 'Buffer value when `buffer` is set (clamped between min and max).',
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
    spinning: {
      control: 'boolean',
      description:
        'Sends the value-length segment travelling along a `"determinate"` track, wrapping past the end back to the beginning.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    easing: {
      control: { type: 'inline-radio' },
      options: linearProgressEasingTokens,
      description: 'Timing function for the value transition and the `spinning` travel.',
      table: { category: 'Visual', defaultValue: { summary: 'linear' } },
    },
    showTrack: {
      control: 'boolean',
      description: 'Renders the faint track behind the bars (dotted edge when `buffer` is set).',
      table: { category: 'Visual', defaultValue: { summary: 'true' } },
    },
    round: {
      control: 'boolean',
      description: "Rounds the bar's corners into a pill shape.",
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    m,
  },
}

export default meta
type Story = StoryObj<typeof LinearProgress>

export const Default: Story = {
  args: {
    variant: 'indeterminate',
    color: 'primary',
  },
}

export const Determinate: Story = {
  args: {
    variant: 'determinate',
    value: 70,
    color: 'primary',
  },
}

export const Buffer: Story = {
  args: {
    variant: 'determinate',
    buffer: true,
    value: 40,
    valueBuffer: 70,
    color: 'primary',
  },
}

export const Query: Story = {
  args: {
    variant: 'query',
    color: 'primary',
  },
}

export const SpinningDeterminate: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {([25, 50, 75] as const).map((value) => (
        <Flex key={value} flexDirection="row" gap={2} alignItems="center">
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {value}%
          </Typography>
          <LinearProgress variant="determinate" value={value} spinning />
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
          <LinearProgress variant="determinate" value={65} color={color} />
        </Flex>
      ))}
    </Flex>
  ),
}

export const Thickness: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {([2, 4, 8, 12] as const).map((thickness) => (
        <Flex key={thickness} flexDirection="row" gap={2} alignItems="center">
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {thickness}px
          </Typography>
          <LinearProgress variant="determinate" value={65} thickness={thickness} />
        </Flex>
      ))}
    </Flex>
  ),
}

export const Easing: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'] as const).map((easing) => (
        <Flex key={easing} flexDirection="row" gap={2} alignItems="center">
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {easing}
          </Typography>
          <LinearProgress variant="determinate" value={65} spinning easing={easing} />
        </Flex>
      ))}
    </Flex>
  ),
}

export const Rounded: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {([4, 8, 12] as const).map((thickness) => (
        <Flex key={thickness} flexDirection="row" gap={2} alignItems="center">
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {thickness}px
          </Typography>
          <LinearProgress variant="determinate" value={65} thickness={thickness} round />
        </Flex>
      ))}
    </Flex>
  ),
}

export const WithoutTrack: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      <Flex flexDirection="row" gap={2} alignItems="center">
        <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
          with track
        </Typography>
        <LinearProgress variant="determinate" value={65} />
      </Flex>
      <Flex flexDirection="row" gap={2} alignItems="center">
        <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
          without
        </Typography>
        <LinearProgress variant="determinate" value={65} showTrack={false} />
      </Flex>
    </Flex>
  ),
}

const useAnimatedProgress = (start: number, step: number, intervalMs: number) => {
  const [progress, setProgress] = useState(start)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((value) => (value >= 100 ? start : value + step))
    }, intervalMs)
    return () => clearInterval(timer)
  }, [start, step, intervalMs])
  return progress
}

const AnimatedDeterminate = () => {
  const progress = useAnimatedProgress(10, 10, 800)
  return <LinearProgress variant="determinate" value={progress} aria-label="Export data" />
}

/** Live determinate bar — `value` updates on a timer and the bar transitions to it. */
export const DeterminateAnimated: Story = {
  render: () => <AnimatedDeterminate />,
}

const AnimatedBuffer = () => {
  const progress = useAnimatedProgress(10, 10, 800)
  const buffer = Math.min(progress + 20, 100)
  return (
    <LinearProgress
      variant="determinate"
      buffer
      value={progress}
      valueBuffer={buffer}
      aria-label="Loading data"
    />
  )
}

/** Live buffer mode — `valueBuffer` stays ahead of `value` as both advance. */
export const BufferAnimated: Story = {
  render: () => <AnimatedBuffer />,
}

const ProgressWithLabel = () => {
  const progress = useAnimatedProgress(20, 10, 800)
  return (
    <Flex flexDirection="column" gap={1}>
      <Typography variant="body2" color="secondary" m={0}>
        Uploading photos…
      </Typography>
      <Flex flexDirection="row" alignItems="center" gap={2}>
        <LinearProgress variant="determinate" value={progress} aria-label="Uploading photos" />
        <Typography variant="caption" color="secondary" m={0} flexShrink={0}>
          {`${Math.round(progress)}%`}
        </Typography>
      </Flex>
    </Flex>
  )
}

/** Progress value displayed alongside the bar. */
export const WithLabel: Story = {
  render: () => <ProgressWithLabel />,
}

const ELEVATOR_FLOORS = ['Ground floor', 'First floor', 'Second floor', 'Third floor'] as const

const ElevatorStatus = () => {
  const [floor, setFloor] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setFloor((current) => (current + 1) % ELEVATOR_FLOORS.length)
    }, 1200)
    return () => clearInterval(timer)
  }, [])
  const value = (floor / (ELEVATOR_FLOORS.length - 1)) * 100
  return (
    <Flex flexDirection="column" gap={1}>
      <Typography variant="body2" color="secondary" m={0}>
        Elevator status: {ELEVATOR_FLOORS[floor]}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={value}
        aria-label="Elevator status"
        aria-valuetext={ELEVATOR_FLOORS[floor]}
      />
    </Flex>
  )
}

/**
 * By default assistive technology reads the progress value as a percentage.
 * Use `aria-valuetext` when the value does not represent a percentage.
 */
export const CustomValueText: Story = {
  render: () => <ElevatorStatus />,
}

export const CustomRange: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(
        [
          { value: 3, min: 0, max: 10, label: '3 of 10' },
          { value: 120, min: 0, max: 200, label: '120 of 200' },
        ] as const
      ).map(({ value, min, max, label }) => (
        <Flex key={label} flexDirection="row" gap={2} alignItems="center">
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {label}
          </Typography>
          <LinearProgress variant="determinate" value={value} min={min} max={max} />
        </Flex>
      ))}
    </Flex>
  ),
}
