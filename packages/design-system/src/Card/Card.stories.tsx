import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  bg,
  borderColor,
  borderRadius,
  borderStyle,
  borderWidth,
  m,
  p,
} from '../utils/test/storiesArgs'
import { cardVariantTokens } from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { View } from '../View'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'Theme/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'children',
        'variant',
        'icon',
        'title',
        'caption',
        'elevation',
        'bg',
        'borderRadius',
        'borderColor',
        'borderWidth',
        'borderStyle',
        'p',
        'm',
      ],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Additional content rendered below the caption.',
      table: { category: 'Content' },
    },
    icon: {
      control: { type: 'select' },
      options: [undefined, 'account_tree', 'psychology', 'smart_toy', 'code'],
      description: 'Icon registry name rendered as the topmost element of the card.',
      table: { category: 'Content' },
    },
    title: {
      control: 'text',
      description:
        'Rendered as `caption` Typography with `color="primary"` and `fontFamily="mono"`.',
      table: { category: 'Content' },
    },
    caption: {
      control: 'text',
      description: 'Rendered as `caption` Typography with `color="secondary"`.',
      table: { category: 'Content' },
    },
    variant: {
      control: { type: 'inline-radio' },
      options: cardVariantTokens,
      description:
        '`paper` uses a plain Paper surface; `bracketBox` adds corner bracket accents; `interactive` fills with the secondary background on hover.',
      table: { category: 'Visual', defaultValue: { summary: 'paper' } },
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'Shadow depth — 0 (flat) to 24 (highest). Resolves to theme.shadows[n].',
      table: { category: 'Visual', defaultValue: { summary: '1' } },
    },
    bg,
    borderRadius,
    borderColor,
    borderWidth,
    borderStyle,
    p,
    m,
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    title: 'Component',
    caption: 'A flexible card surface with paper and bracketBox variants.',
    p: 3,
  },
}

export const Paper: Story = {
  render: () => (
    <Card variant="paper" p={3} title="Paper" caption="Default surface with elevation shadow." />
  ),
}

export const BracketBox: Story = {
  render: () => (
    <Card
      variant="bracketBox"
      p={3}
      elevation={0}
      title="BracketBox"
      caption="Flat surface with corner bracket accents."
    />
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Card
      variant="interactive"
      icon="account_tree"
      iconProps={{ color: 'primary', size: '2.25rem' }}
      p={4}
      bg="paper"
      title="System Scalability"
      caption="Pass an icon name and the card renders it."
    />
  ),
}

export const Interactive: Story = {
  render: () => (
    <Card
      variant="interactive"
      p={3}
      bg="paper"
      title="Interactive"
      caption="Hover to fill with the secondary background."
    />
  ),
}

export const Variants: Story = {
  render: () => (
    <Flex flexDirection="row" gap={3} flexWrap="wrap">
      <Card variant="paper" p={3} title="paper" caption="Default card variant." />
      <Card
        variant="bracketBox"
        p={3}
        elevation={0}
        title="bracketBox"
        caption="Corner bracket variant."
      />
      <Card
        variant="interactive"
        p={3}
        bg="paper"
        title="interactive"
        caption="Hover-fill variant."
      />
    </Flex>
  ),
}

export const TitleOnly: Story = {
  render: () => <Card p={3} title="Title Only" />,
}

export const SubtitleOnly: Story = {
  render: () => <Card p={3} caption="Subtitle only — no title above it." />,
}

export const WithChildren: Story = {
  render: () => (
    <Card variant="bracketBox" p={3} elevation={0} title="Stack" caption="Tech in use.">
      <View mt={2}>
        {['React', 'TypeScript', 'Vite'].map((item) => (
          <View key={item} p={0.5}>
            {item}
          </View>
        ))}
      </View>
    </Card>
  ),
}
