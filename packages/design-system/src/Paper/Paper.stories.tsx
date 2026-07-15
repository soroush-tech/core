import type { Meta, StoryObj } from '@storybook/react-vite'
import { bg, cursor, height, m, opacity, p, width } from '../utils/test/storiesArgs'
import { borderRadiiTokens } from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { Paper } from './Paper'

const meta: Meta<typeof Paper> = {
  title: 'Theme/Paper',
  component: Paper,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'children',
        'elevation',
        'bg',
        'borderRadius',
        'aspectRatio',
        'transition',
        'opacity',
        'cursor',
        'm',
        'p',
        'width',
        'height',
      ],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Content rendered inside the surface.',
      table: { category: 'Content' },
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'Shadow depth — 0 (flat) to 24 (highest). Resolves to theme.shadows[n].',
      table: { category: 'Visual', defaultValue: { summary: '1' } },
    },
    bg,
    borderRadius: {
      control: { type: 'inline-radio' },
      options: borderRadiiTokens,
      description: 'Border radius — resolves from theme.radii.',
      table: { category: 'Visual', defaultValue: { summary: 'md' } },
    },
    aspectRatio: {
      control: 'text',
      description: 'CSS aspect-ratio for fixed-ratio surfaces (e.g. "16/9", "1").',
      table: { category: 'Layout' },
    },
    transition: {
      control: 'text',
      description: 'CSS transition for surface animations (e.g. "box-shadow 0.3s ease").',
      table: { category: 'Visual' },
    },
    opacity,
    cursor,
    m,
    p,
    width,
    height,
  },
}

export default meta
type Story = StoryObj<typeof Paper>

export const Default: Story = {
  args: {
    elevation: 1,
    p: 3,
    width: '320px',
    children: 'A surface with default elevation, background, and border radius.',
  },
}

export const Elevations: Story = {
  render: () => (
    <Flex flexDirection="row" flexWrap="wrap" gap={3}>
      {([0, 1, 2, 4, 8, 16, 24] as const).map((n) => (
        <Paper key={n} elevation={n} p={3} width="120px">
          <Typography variant="caption" color="secondary" m={0}>
            elevation
          </Typography>
          <Typography variant="body2" m={0}>
            {n}
          </Typography>
        </Paper>
      ))}
    </Flex>
  ),
}

export const BackgroundTokens: Story = {
  render: () => (
    <Flex flexDirection="row" flexWrap="wrap" gap={3}>
      {(['paper', 'primary', 'secondary', 'modal'] as const).map((bg) => (
        <Paper key={bg} bg={bg} elevation={2} p={3} width="140px">
          <Typography variant="caption" color="secondary" m={0}>
            bg
          </Typography>
          <Typography variant="body2" m={0}>
            {bg}
          </Typography>
        </Paper>
      ))}
    </Flex>
  ),
}

export const AspectRatio: Story = {
  render: () => (
    <Flex flexDirection="row" flexWrap="wrap" gap={3}>
      {(['1', '4/3', '16/9'] as const).map((ratio) => (
        <Paper key={ratio} elevation={2} aspectRatio={ratio} width="160px">
          <Flex height="100%" alignItems="center" justifyContent="center">
            <Typography variant="caption" color="secondary" m={0}>
              {ratio}
            </Typography>
          </Flex>
        </Paper>
      ))}
    </Flex>
  ),
}

export const Composed: Story = {
  render: () => (
    <Paper elevation={3} p={4} width="320px">
      <Flex flexDirection="column" gap={2}>
        <Typography variant="h5" m={0}>
          Card Title
        </Typography>
        <Typography variant="body2" color="secondary" m={0}>
          Compose Flex or Grid inside Paper for layout. Paper intentionally has no flex or grid
          props.
        </Typography>
      </Flex>
    </Paper>
  ),
}
