import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  asTokens,
  fontSizeIndices,
  fontWeightTokens,
  textColorTokens,
  typographyVariantTokens,
} from 'src/theme/utils/test/storiesOptions'
import { Flex } from 'src/theme/Flex'
import { GlitchText } from './GlitchText'

const meta = {
  title: 'Common/GlitchText',
  component: GlitchText,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Extends [`Typography`](../Typography). Renders a looping RGB-split glitch animation. ' +
          'The two split layers are token-driven via `color` / `secondaryColor`; `inverted` plays ' +
          'the opposite keyframes so stacked instances do not jitter in lock-step.',
      },
    },
    controls: {
      include: [
        'children',
        'color',
        'secondaryColor',
        'inverted',
        'variant',
        'as',
        'fontSize',
        'fontWeight',
      ],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Text content rendered inside the element.',
      table: { category: 'Content' },
    },
    color: {
      control: { type: 'select' },
      options: textColorTokens,
      description:
        'Glyph fill and first RGB-split layer (`--glitch-a`) — resolves from theme.text.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    secondaryColor: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Second RGB-split layer (`--glitch-b`) — resolves from theme.text.',
      table: { category: 'Visual', defaultValue: { summary: 'error' } },
    },
    inverted: {
      control: 'boolean',
      description: 'Play the opposite (mirrored) glitch keyframes.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    variant: {
      control: { type: 'select' },
      options: typographyVariantTokens,
      description: 'Typographic scale inherited from Typography.',
      table: { category: 'Typography', defaultValue: { summary: 'body1' } },
    },
    as: {
      control: { type: 'select' },
      options: asTokens,
      description: 'Overrides the rendered HTML element.',
      table: { category: 'Layout' },
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
  },
} satisfies Meta<typeof GlitchText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    as: 'h1',
    children: '404',
    color: 'primary',
    secondaryColor: 'error',
    fontSize: 6,
    fontWeight: 'bold',
  },
}

export const Inverted: Story = {
  args: {
    as: 'h1',
    children: 'SYSTEM FAILURE',
    color: 'primary',
    secondaryColor: 'error',
    fontSize: 6,
    fontWeight: 'bold',
    inverted: true,
  },
}

export const CustomColors: Story = {
  args: {
    as: 'h1',
    children: 'GLITCH',
    color: 'primary',
    secondaryColor: 'secondary',
    fontSize: 6,
    fontWeight: 'bold',
  },
}

export const Stacked: Story = {
  render: () => (
    <Flex flexDirection="column" alignItems="center" gap={2}>
      <GlitchText as="h1" fontSize={6} fontWeight="bold">
        404
      </GlitchText>
      <GlitchText inverted color="secondary">
        The default and inverted keyframes run out of phase.
      </GlitchText>
    </Flex>
  ),
}
