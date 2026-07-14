import { css, keyframes } from '@emotion/css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { m, p } from '../utils/test/storiesArgs'
import { dark } from '../themes'
import {
  borderRadiiTokens,
  buttonColorTokens,
  buttonLoadingPositionTokens,
  buttonShapeTokens,
  buttonSizeTokens,
  buttonVariantTokens,
} from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Theme/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'children',
        'variant',
        'color',
        'size',
        'shape',
        'borderRadius',
        'fullWidth',
        'disabled',
        'loading',
        'loadingPosition',
        'href',
        'm',
        'p',
      ],
    },
  },
  args: {
    children: 'Action',
    onClick: fn(),
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Button label text.',
      table: { category: 'Content' },
    },
    variant: {
      control: { type: 'inline-radio' },
      options: buttonVariantTokens,
      description: 'Visual style — filled, stroked, or ghost.',
      table: { category: 'Visual', defaultValue: { summary: 'contained' } },
    },
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description: 'Color palette — resolves from `theme.palette[color]`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: { type: 'inline-radio' },
      options: buttonSizeTokens,
      description: 'Controls padding and font size.',
      table: { category: 'Visual', defaultValue: { summary: 'md' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch button to full container width.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading indicator and disables the button.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    shape: {
      control: { type: 'inline-radio' },
      options: buttonShapeTokens,
      description:
        'Corner shape — sets the default `borderRadius`. `borderRadius` prop always overrides.',
      table: { category: 'Visual', defaultValue: { summary: 'rounded' } },
    },
    borderRadius: {
      control: { type: 'inline-radio' },
      options: borderRadiiTokens,
      description:
        'Border radius token from `theme.radii`. Overrides `shape`. Only meaningful when `shape="rounded"`.',
      table: { category: 'Visual' },
    },
    loadingPosition: {
      control: { type: 'inline-radio' },
      options: buttonLoadingPositionTokens,
      description: 'Where the loading indicator appears relative to the label.',
      table: { category: 'Visual', defaultValue: { summary: 'center' } },
    },
    href: {
      control: 'text',
      description: 'URL to link to. If defined, the root renders as an `a` element.',
      table: { category: 'Content' },
    },
    m,
    p,
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    size: 'md',
    children: 'Action',
  },
}

export const Variants: Story = {
  render: () => (
    <Flex flexDirection="row" gap={2} flexWrap="wrap">
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
    </Flex>
  ),
}

export const Colors: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const).map((color) => (
        <Flex key={color} flexDirection="row" gap={2} alignItems="center" flexWrap="wrap">
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {color}
          </Typography>
          <Button variant="contained" color={color}>
            Contained
          </Button>
          <Button variant="outlined" color={color}>
            Outlined
          </Button>
          <Button variant="text" color={color}>
            Text
          </Button>
        </Flex>
      ))}
    </Flex>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Flex flexDirection="row" gap={2} alignItems="center" flexWrap="wrap">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Flex>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2}>
      <Flex flexDirection="row" gap={2} flexWrap="wrap">
        <Button startIcon={<span>▶</span>}>Start Icon</Button>
        <Button endIcon={<span>◀</span>}>End Icon</Button>
        <Button startIcon={<span>▶</span>} endIcon={<span>◀</span>}>
          Both Icons
        </Button>
      </Flex>
      <Flex flexDirection="row" gap={2} flexWrap="wrap">
        <Button variant="outlined" startIcon={<span>+</span>}>
          New Item
        </Button>
        <Button variant="text" endIcon={<span>→</span>}>
          Learn More
        </Button>
      </Flex>
    </Flex>
  ),
}

export const Loading: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['start', 'center', 'end'] as const).map((pos) => (
        <Flex key={pos} flexDirection="row" gap={2} alignItems="center">
          <Typography variant="caption" color="secondary" width="4rem" flexShrink={0} m={0}>
            {pos}
          </Typography>
          <Button loading loadingPosition={pos} startIcon={<span>▶</span>}>
            Deploy
          </Button>
          <Button loading loadingPosition={pos} variant="outlined">
            Deploy
          </Button>
          <Button loading loadingPosition={pos} variant="text">
            Deploy
          </Button>
        </Flex>
      ))}
    </Flex>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Flex flexDirection="row" gap={2} flexWrap="wrap">
      <Button disabled variant="contained">
        Contained
      </Button>
      <Button disabled variant="outlined">
        Outlined
      </Button>
      <Button disabled variant="text">
        Text
      </Button>
    </Flex>
  ),
}

export const AsLink: Story = {
  name: 'As Link (href)',
  render: () => (
    <Flex flexDirection="row" gap={2} flexWrap="wrap" alignItems="center">
      <Button href="#contained">Contained</Button>
      <Button href="#outlined" variant="outlined" endIcon={<span>→</span>}>
        Outlined
      </Button>
      <Button href="#text" variant="text">
        Text
      </Button>
    </Flex>
  ),
}

export const FullWidth: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2} maxWidth="480px">
      <Button fullWidth>Full Width Contained</Button>
      <Button fullWidth variant="outlined">
        Full Width Outlined
      </Button>
    </Flex>
  ),
}

export const Shapes: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3}>
      {(['square', 'rounded', 'pill'] as const).map((shape) => (
        <Flex key={shape} flexDirection="row" gap={2} alignItems="center" flexWrap="wrap">
          <Typography variant="caption" color="secondary" width="5rem" flexShrink={0} m={0}>
            {shape}
          </Typography>
          <Button shape={shape}>Contained</Button>
          <Button shape={shape} variant="outlined">
            Outlined
          </Button>
          <Button shape={shape} variant="text">
            Text
          </Button>
        </Flex>
      ))}
      <Flex flexDirection="column" gap={2}>
        <Typography variant="caption" color="secondary" m={0}>
          rounded — borderRadius override
        </Typography>
        <Flex flexDirection="row" gap={2} flexWrap="wrap">
          <Button shape="rounded" borderRadius="sm">
            sm (4px)
          </Button>
          <Button shape="rounded" borderRadius="md">
            md (8px)
          </Button>
          <Button shape="rounded" borderRadius="lg">
            lg (16px)
          </Button>
        </Flex>
      </Flex>
    </Flex>
  ),
}

// ─── Custom styling showcase ───────────────────────────────────────────────────

const gradientShift = keyframes({
  to: { backgroundPosition: '200% center' },
})

const RAINBOW = [
  'hsl(0 100% 50%)',
  'hsl(270 100% 50%)',
  'hsl(210 100% 50%)',
  'hsl(195 100% 50%)',
  'hsl(90 100% 50%)',
  'hsl(0 100% 50%)',
]

// Returns a plain className — no new component needed. Button props handle
// shape/typography; only the animated gradient border needs custom CSS.
// The `&&` selector doubles specificity to beat Button's own variant styles.
function rainbowBorderClass({
  speed = '2s',
  innerBg = dark.background.paper,
  colors = RAINBOW,
}: { speed?: string; innerBg?: string; colors?: string[] } = {}) {
  return css({
    '&&': {
      textTransform: 'initial',
      border: '1px solid transparent',
      borderBottomWidth: '2.5px',
      background: [
        `linear-gradient(${innerBg}, ${innerBg}) padding-box`,
        `linear-gradient(90deg, ${colors.join(', ')}) border-box`,
      ].join(', '),
      backgroundSize: '200% auto',
      animation: `${gradientShift} ${speed} linear infinite`,
      '&:hover:not(:disabled), &:active:not(:disabled)': {
        backgroundColor: 'transparent',
      },
    },
  })
}

export const RainbowBorder: Story = {
  name: 'Custom — Rainbow Border',
  render: () => (
    <Flex flexDirection="column" gap={4}>
      <Flex flexDirection="row" gap={3} alignItems="center">
        <Button
          variant="text"
          shape="pill"
          letterSpacing="normal"
          fontWeight="medium"
          className={rainbowBorderClass()}
        >
          Get started
        </Button>
        <Button
          variant="text"
          shape="pill"
          letterSpacing="normal"
          fontWeight="medium"
          className={rainbowBorderClass({ speed: '4s' })}
        >
          Slow (4s)
        </Button>
        <Button
          variant="text"
          shape="pill"
          letterSpacing="normal"
          fontWeight="medium"
          disabled
          className={rainbowBorderClass()}
        >
          Disabled
        </Button>
      </Flex>
      <Flex flexDirection="row" gap={3} alignItems="center">
        <Button
          variant="text"
          shape="pill"
          letterSpacing="normal"
          fontWeight="medium"
          className={rainbowBorderClass({
            colors: [
              dark.palette.primary.main,
              dark.palette.secondary.main,
              dark.palette.primary.main,
            ],
          })}
        >
          Theme colors
        </Button>
        <Button
          variant="text"
          shape="pill"
          letterSpacing="normal"
          fontWeight="medium"
          className={rainbowBorderClass({
            colors: [dark.palette.error.main, dark.palette.warning.main, dark.palette.error.main],
            speed: '1s',
          })}
        >
          Fast warm
        </Button>
      </Flex>
    </Flex>
  ),
}
