import type { Meta, StoryObj } from '@storybook/react-vite'
import { bg, m } from '../utils/test/storiesArgs'
import {
  avatarSizeTokens,
  avatarVariantTokens,
  borderColorTokens,
  borderWidthTokens,
} from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { Avatar } from './Avatar'

const DEMO_IMG = '/soroush.svg'

const meta: Meta<typeof Avatar> = {
  title: 'Theme/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    ring: false,
  },
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'src',
        'srcSet',
        'fallback',
        'alt',
        'children',
        'variant',
        'size',
        'ring',
        'ringColor',
        'ringWidth',
        'bg',
        'm',
      ],
    },
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Primary image URL.',
      table: { category: 'Content' },
    },
    srcSet: {
      control: 'text',
      description: 'Responsive image URLs — used as the primary source when `src` is absent.',
      table: { category: 'Content' },
    },
    fallback: {
      control: 'text',
      description:
        'Fallback image URL shown when `src` is absent. Children are shown when both are absent.',
      table: { category: 'Content' },
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image, required for accessibility.',
      table: { category: 'Content' },
    },
    children: {
      control: 'text',
      description: 'Fallback content rendered when no `src` is provided (initials, icon, etc.).',
      table: { category: 'Content' },
    },
    variant: {
      control: { type: 'inline-radio' },
      options: avatarVariantTokens,
      description: 'Shape of the avatar container.',
      table: { category: 'Layout', defaultValue: { summary: 'circular' } },
    },
    size: {
      control: { type: 'inline-radio' },
      options: avatarSizeTokens,
      description:
        'Preset size — resolves against theme.space (small=32px, medium=40px, large=48px).',
      table: { category: 'Layout', defaultValue: { summary: 'medium' } },
    },
    ring: {
      control: 'boolean',
      description: 'Adds a CSS outline ring around the avatar.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    ringColor: {
      control: { type: 'select' },
      options: borderColorTokens,
      description: 'Ring color — resolves against theme.border.',
      table: { category: 'Visual' },
    },
    ringWidth: {
      control: { type: 'select' },
      options: borderWidthTokens,
      description: 'Ring width — resolves against theme.borderWidths.',
      table: { category: 'Visual' },
    },
    bg,
    m,
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  args: {
    src: DEMO_IMG,
    alt: 'Soroush logo',
    variant: 'circular',
    size: 'md',
  },
}

export const FallbackImage: Story = {
  args: {
    fallback: DEMO_IMG,
    alt: 'Fallback image',
    variant: 'circular',
    size: 'md',
  },
}

export const FallbackInitials: Story = {
  args: {
    children: 'MS',
    variant: 'circular',
    size: 'md',
    bg: 'secondary',
  },
}

export const AllVariants: Story = {
  render: () => (
    <Flex flexDirection="row" gap={3} alignItems="center">
      {(['circular', 'rounded', 'square'] as const).map((v) => (
        <Flex key={v} alignItems="center" gap={1}>
          <Avatar variant={v} size="lg" bg="secondary">
            MS
          </Avatar>
          <Typography variant="caption" color="secondary" m={0}>
            {v}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <Flex flexDirection="row" gap={3} alignItems="flex-end">
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Flex key={s} alignItems="center" gap={1}>
          <Avatar size={s} bg="secondary">
            MS
          </Avatar>
          <Typography variant="caption" color="secondary" m={0}>
            {s}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const WithRing: Story = {
  args: {
    src: DEMO_IMG,
    alt: 'Soroush logo',
    variant: 'circular',
    size: 'lg',
    ring: true,
  },
}

export const RingShapes: Story = {
  render: () => (
    <Flex flexDirection="row" gap={4} alignItems="center">
      {(['circular', 'rounded', 'square'] as const).map((v) => (
        <Flex key={v} alignItems="center" gap={1}>
          <Avatar ring variant={v} size="lg" bg="secondary">
            MS
          </Avatar>
          <Typography variant="caption" color="secondary" m={0}>
            {v}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const RingVariants: Story = {
  render: () => (
    <Flex flexDirection="row" gap={4} alignItems="center">
      {(['light', 'primary', 'dark'] as const).map((c) => (
        <Flex key={c} alignItems="center" gap={1}>
          <Avatar ring ringColor={c} size="lg" bg="secondary">
            MS
          </Avatar>
          <Typography variant="caption" color="secondary" m={0}>
            {c}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}
