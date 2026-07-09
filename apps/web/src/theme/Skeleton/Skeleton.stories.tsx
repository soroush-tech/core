import type { Meta, StoryObj } from '@storybook/react-vite'
import { m, width, height, borderRadius } from 'src/theme/utils/test/storiesArgs'
import { skeletonVariantTokens, skeletonAnimationTokens } from 'src/theme/utils/test/storiesOptions'
import { Avatar } from 'src/theme/Avatar'
import { Card } from 'src/theme/Card'
import { Flex } from 'src/theme/Flex'
import { Grid } from 'src/theme/Grid'
import { Image } from 'src/theme/Image'
import { Paper } from 'src/theme/Paper'
import { Typography } from 'src/theme/Typography'
import { View } from 'src/theme/View'
import { Skeleton, type SkeletonProps } from './Skeleton'
import portrait from 'src/assets/masoud_soroush.png?w=320;480;640;768;960;1200&format=avif;webp;png&as=picture'
const MEDIA_SIZES = '(min-width: 640px) min(30vw, 400px), 100vw'

const meta: Meta<typeof Skeleton> = {
  title: 'Theme/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: {
    variant: 'text',
    animation: 'pulse',
  },
  parameters: {
    layout: 'padded',
    controls: {
      include: ['variant', 'borderRadius', 'animation', 'width', 'height', 'children', 'm'],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: skeletonVariantTokens,
      description: 'Shape of the placeholder.',
      table: { category: 'Layout', defaultValue: { summary: 'text' } },
    },
    animation: {
      control: { type: 'select' },
      options: skeletonAnimationTokens,
      description: 'Loading animation — `false` disables it.',
      table: { category: 'Behavior', defaultValue: { summary: 'pulse' } },
    },
    children: {
      control: 'text',
      description: 'Content to infer width and height from — rendered invisibly.',
      table: { category: 'Content' },
    },
    borderRadius,
    width,
    height,
    m,
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Text: Story = {
  args: { width: 240 },
}

export const Variants: Story = {
  render: ({ animation }) => (
    <Flex flexDirection="row" gap={4} alignItems="center">
      {skeletonVariantTokens.map((v) => (
        <Flex key={v} flexDirection="column" gap={1} alignItems="center">
          <Skeleton
            variant={v}
            width={64}
            height={v === 'text' ? undefined : 64}
            animation={animation}
          />
          <Typography variant="caption" color="secondary" m={0}>
            {v}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const Animations: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {skeletonAnimationTokens.map((a) => (
        <Flex key={String(a)} flexDirection="column" gap={1}>
          <Typography variant="caption" color="secondary" m={0}>
            {a === false ? 'false (none)' : a}
          </Typography>
          <Skeleton
            variant="rectangular"
            borderRadius="md"
            width="100%"
            height={24}
            animation={a}
          />
        </Flex>
      ))}
    </Flex>
  ),
}

// Different-sized skeletons share one viewport-anchored wave — the shimmer stays in sync.
export const WaveInSync: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2}>
      <Skeleton variant="rectangular" borderRadius="md" width="90%" height={20} animation="wave" />
      <Skeleton variant="rectangular" borderRadius="md" width="40%" height={20} animation="wave" />
      <Skeleton variant="rectangular" borderRadius="md" width="65%" height={20} animation="wave" />
    </Flex>
  ),
}

export const InferredFromChildren: Story = {
  render: ({ animation }) => (
    <Skeleton animation={animation}>
      <Typography variant="h3" m={0}>
        Loading title
      </Typography>
    </Skeleton>
  ),
}

export const MediaCard: Story = {
  render: ({ animation }) => (
    <Flex flexDirection="row" gap={2} alignItems="center">
      <Skeleton variant="circular" width={40} height={40} animation={animation} />
      <Flex flexDirection="column" gap={1} flex={1}>
        <Skeleton variant="text" width="60%" animation={animation} />
        <Skeleton variant="text" width="40%" animation={animation} />
      </Flex>
    </Flex>
  ),
}

// Paper surface with an author row, cover image, and body lines. `animation` is threaded
// into every skeleton so the Storybook control drives the whole card at once.
const PostCardSkeleton = ({ animation }: Pick<SkeletonProps, 'animation'>) => (
  <Paper flexDirection="column" gap={2} p={3} width="100%">
    <Flex flexDirection="row" gap={2} alignItems="center">
      <Skeleton variant="circular" width={44} height={44} animation={animation} />
      <Flex flexDirection="column" gap={1} flex={1}>
        <Skeleton variant="text" width="55%" animation={animation} />
        <Skeleton variant="text" width="35%" animation={animation} />
      </Flex>
    </Flex>
    <Skeleton
      variant="rectangular"
      borderRadius="md"
      width="100%"
      height={400}
      animation={animation}
    />
    <Flex flexDirection="column" gap={1}>
      <Skeleton variant="text" width="90%" animation={animation} />
      <Skeleton variant="text" width="80%" animation={animation} />
    </Flex>
  </Paper>
)

// The real, loaded card built from our design system — same layout the skeleton stands in for.
const RealPostCard = () => (
  <Card variant="paper" flexDirection="column" gap={2} p={3} width="100%">
    <Flex flexDirection="row" gap={2} alignItems="center">
      <Avatar size="md" bg="secondary">
        MS
      </Avatar>
      <Flex flexDirection="column" gap={0}>
        <Typography variant="subtitle2" m={0}>
          Masoud Soroush
        </Typography>
        <Typography variant="caption" color="secondary" m={1}>
          @soroush
        </Typography>
      </Flex>
    </Flex>
    <View borderRadius="md" overflow="hidden" width="100%" height={400}>
      <picture>
        {Object.entries(portrait.sources).map(([format, srcSet]) => (
          <source key={format} srcSet={srcSet} type={`image/${format}`} sizes={MEDIA_SIZES} />
        ))}
        <Image
          src={portrait.img.src}
          sizes={MEDIA_SIZES}
          alt="Portrait of Masoud Soroush, Principal Software Engineer"
          width="100%"

          objectFit="cover"
          borderRadius="md"
        />
      </picture>
    </View>
    <Typography variant="body2" color="secondary" m={0}>
      Building a design system from the ground up tokens, primitives, and the craft behind
      consistent, accessible components.
    </Typography>
  </Card>
)

// The skeleton next to the real design-system card it stands in for.
export const PostCard: Story = {
  render: ({ animation }) => (
    <Flex flexDirection="row" gap={4} alignItems="flex-start" flexWrap="wrap">
      <Flex flexDirection="column" gap={1} width={360}>
        <Typography variant="overline" color="secondary" m={0}>
          Loading
        </Typography>
        <PostCardSkeleton animation={animation} />
      </Flex>
      <Flex flexDirection="column" gap={1} width={360}>
        <Typography variant="overline" color="secondary" m={0}>
          Loaded
        </Typography>
        <RealPostCard />
      </Flex>
    </Flex>
  ),
}

// A feed of post-card skeletons on a 6:3 grid (2fr 1fr) — two cards per row.
export const PostCardGrid: Story = {
  render: ({ animation }) => (
    <Grid gridTemplateColumns="2fr 1fr" gap={3}>
      {Array.from({ length: 4 }, (_, i) => (
        <PostCardSkeleton key={i} animation={animation} />
      ))}
    </Grid>
  ),
}
