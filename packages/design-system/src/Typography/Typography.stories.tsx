import type { Meta, StoryObj } from '@storybook/react-vite'
import { bg, m, opacity, p } from '../utils/test/storiesArgs'
import {
  alignTokens,
  asTokens,
  fontFamilyTokens,
  fontSizeIndices,
  fontStyleTokens,
  fontWeightTokens,
  letterSpacingTokens,
  lineHeightTokens,
  textColorTokens,
  typographyVariantTokens,
} from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { View } from '../View'
import { Typography } from './Typography'

const meta: Meta<typeof Typography> = {
  title: 'Theme/Typography',
  component: Typography,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      // Only show the Typography-specific and key styled-system props.
      // Without this, Storybook lists every HTMLAttributes<HTMLElement> field.
      include: [
        'children',
        'variant',
        'align',
        'gutterBottom',
        'noWrap',
        'as',
        'color',
        'bg',
        'opacity',
        'm',
        'p',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'lineHeight',
        'letterSpacing',
      ],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Text content rendered inside the element.',
      table: { category: 'Content' },
    },
    variant: {
      control: { type: 'select' },
      options: typographyVariantTokens,
      description: 'Sets typographic scale and maps to a semantic HTML element via variantMapping.',
      table: { category: 'Typography', defaultValue: { summary: 'body1' } },
    },
    align: {
      control: { type: 'inline-radio' },
      options: alignTokens,
      description: 'CSS text-align.',
      table: { category: 'Layout' },
    },
    gutterBottom: {
      control: 'boolean',
      description: 'Adds margin-bottom: 0.5em beneath the element.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    noWrap: {
      control: 'boolean',
      description: 'Clips overflow text with an ellipsis (white-space: nowrap).',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    as: {
      control: { type: 'select' },
      options: asTokens,
      description: 'Overrides the HTML element chosen by variant.',
      table: { category: 'Layout' },
    },
    color: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Semantic text color — resolves from theme.text.',
      table: { category: 'Visual' },
    },
    bg,
    opacity,
    m,
    p,
    fontFamily: {
      control: { type: 'inline-radio' },
      options: fontFamilyTokens,
      description: 'Theme font token (theme.fonts).',
      table: { category: 'Typography' },
    },
    fontSize: {
      control: { type: 'select' },
      options: fontSizeIndices,
      description:
        'theme.fontSizes index — 0=12px · 1=14px · 2=16px · 3=20px · 4=24px · 5=32px · 6=48px',
      table: { category: 'Typography' },
    },
    fontWeight: {
      control: { type: 'select' },
      options: fontWeightTokens,
      description: 'Theme font-weight keyword (theme.fontWeights).',
      table: { category: 'Typography' },
    },
    fontStyle: {
      control: { type: 'inline-radio' },
      options: fontStyleTokens,
      description: 'CSS font-style.',
      table: { category: 'Typography' },
    },
    lineHeight: {
      control: { type: 'select' },
      options: lineHeightTokens,
      description:
        'theme.lineHeights key — none=1 · tight=1.2 · snug=1.35 · base=1.5 · relaxed=1.625 · loose=2',
      table: { category: 'Typography' },
    },
    letterSpacing: {
      control: { type: 'select' },
      options: letterSpacingTokens,
      description: 'theme.letterSpacings key.',
      table: { category: 'Typography' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Typography>

export const Default: Story = {
  args: {
    variant: 'body1',
    children: 'Great products are built through clarity, consistency, and attention to detail.',
  },
}

export const AllVariants: Story = {
  render: () => (
    <Flex>
      {(
        [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'subtitle1',
          'subtitle2',
          'body1',
          'body2',
          'caption',
          'overline',
          'button',
        ] as const
      ).map((v) => (
        <Flex key={v} flexDirection="row" alignItems="center" mb={1}>
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {v}
          </Typography>
          <Typography variant={v} m={0}>
            The quick brown fox
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

const ALIGN_TEXT: Record<string, string> = {
  left: 'The quick brown fox jumps over the lazy dog.',
  center: 'The quick brown fox jumps over the lazy dog.',
  right: 'The quick brown fox jumps over the lazy dog.',
  justify:
    'Justify only stretches lines that wrap — the last line stays left. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.',
}

export const Alignment: Story = {
  render: () => (
    <Flex width="360px">
      {(['left', 'center', 'right', 'justify'] as const).map((align) => (
        <View key={align} mb={3}>
          <Typography variant="caption" color="secondary" mb={0.5} m={0}>
            {align}
          </Typography>
          <Typography variant="body1" align={align} m={0}>
            {ALIGN_TEXT[align]}
          </Typography>
        </View>
      ))}
    </Flex>
  ),
}

export const Colors: Story = {
  render: () => (
    <Flex p={3}>
      {(
        [
          'inherit',
          'initial',
          'primary',
          'secondary',
          'disabled',
          'error',
          'success',
          'info',
          'warning',
        ] as const
      ).map((c) => (
        <Flex key={c} flexDirection="row" alignItems="center" mb={1}>
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {c}
          </Typography>
          <Typography variant="body1" color={c} m={0}>
            The quick brown fox
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const LetterSpacing: Story = {
  render: () => (
    <Flex>
      {(['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'] as const).map((ls) => (
        <Flex key={ls} flexDirection="row" alignItems="baseline" mb={1}>
          <Typography variant="caption" color="secondary" width="5rem" flexShrink={0} m={0}>
            {ls}
          </Typography>
          <Typography variant="body1" letterSpacing={ls} m={0}>
            The quick brown fox
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const LineHeights: Story = {
  render: () => (
    <Flex>
      {(['none', 'tight', 'snug', 'base', 'relaxed', 'loose'] as const).map((lh) => (
        <Flex key={lh} flexDirection="row" alignItems="flex-start" mb={2}>
          <Typography variant="caption" color="secondary" width="5rem" flexShrink={0} mt={0} mb={0}>
            {lh}
          </Typography>
          <Typography variant="body2" lineHeight={lh} m={0} maxWidth="320px">
            The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}

export const NoWrap: Story = {
  render: () => (
    <View width="240px" border="1px dashed" borderColor="light" p={1.5}>
      <Typography variant="body1" noWrap m={0}>
        This very long text will be truncated with an ellipsis when it overflows its container.
      </Typography>
      <Typography variant="caption" color="secondary" mt={1} mb={0}>
        ↑ noWrap (240px container)
      </Typography>
    </View>
  ),
}

export const GutterBottom: Story = {
  render: () => (
    <View border="1px dashed" borderColor="light" p={1.5} maxWidth="480px">
      <Typography variant="h4" gutterBottom>
        Heading with gutterBottom
      </Typography>
      <Typography variant="body1" m={0}>
        This paragraph follows directly after the heading. The gutter (0.5em) creates breathing room
        between them without extra margin props.
      </Typography>
    </View>
  ),
}

export const Composed: Story = {
  render: () => (
    <Flex as="article" maxWidth="480px">
      <Typography variant="overline" color="secondary" m={0}>
        Design system
      </Typography>
      <Typography variant="h2" gutterBottom mt={0}>
        Typography component
      </Typography>
      <Typography variant="subtitle1" color="secondary" m={0}>
        A flexible text primitive with variant, alignment, truncation, and full styled-system
        support.
      </Typography>
      <Typography variant="body2" mt={2} mb={0}>
        Variants map to semantic HTML elements via{' '}
        <Typography as="code" variant="inherit">
          variantMapping
        </Typography>
        . Pass{' '}
        <Typography as="code" variant="inherit">
          as
        </Typography>{' '}
        to override the element while keeping variant styles.
      </Typography>
      <Typography variant="caption" color="secondary" mt={1} mb={0}>
        Last updated: 2026
      </Typography>
    </Flex>
  ),
}
