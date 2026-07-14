import type { Meta, StoryObj } from '@storybook/react-vite'
import { m, p } from '../utils/test/storiesArgs'
import {
  linkUnderlineTokens,
  linkTargetTokens,
  linkRelTokens,
  textColorTokens,
  typographyVariantTokens,
} from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { Link } from './Link'

const meta: Meta<typeof Link> = {
  title: 'Theme/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['children', 'href', 'underline', 'variant', 'color', 'target', 'rel', 'm', 'p'],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Link text content.',
      table: { category: 'Content' },
    },
    href: {
      control: 'text',
      description: 'URL the link points to.',
      table: { category: 'Content' },
    },
    target: {
      control: { type: 'select' },
      options: linkTargetTokens,
      description:
        'Specifies where to open the linked URL. Setting `"_blank"` auto-injects `rel="noopener noreferrer"` unless `rel` is already provided.',
      table: { category: 'Content', defaultValue: { summary: '_self' } },
    },
    rel: {
      control: { type: 'select' },
      options: linkRelTokens,
      description:
        'Relationship between the document and the linked resource. Only values valid for `<a>` are listed; space-separate multiple values manually.',
      table: { category: 'Content' },
    },
    underline: {
      control: { type: 'inline-radio' },
      options: linkUnderlineTokens,
      description:
        'Controls `text-decoration`. `"hover"` shows the underline only on pointer hover.',
      table: { category: 'Visual', defaultValue: { summary: 'always' } },
    },
    color: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Semantic text color — resolves from `theme.text`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    variant: {
      control: { type: 'select' },
      options: typographyVariantTokens,
      description: 'Typographic scale. Inherits surrounding text size by default (`"inherit"`).',
      table: { category: 'Typography', defaultValue: { summary: 'inherit' } },
    },
    m,
    p,
  },
}

export default meta
type Story = StoryObj<typeof Link>

export const Default: Story = {
  args: {
    href: '#',
    children: 'Visit the design system docs',
  },
}

export const Underline: Story = {
  render: () => (
    <Flex>
      {linkUnderlineTokens.map((u) => (
        <Flex key={u} flexDirection="row" alignItems="center" mb={2}>
          <Typography variant="caption" color="secondary" width="4rem" flexShrink={0} m={0}>
            {u}
          </Typography>
          <Link href="#" underline={u}>
            {u === 'hover' ? 'Hover to see underline' : `underline="${u}"`}
          </Link>
        </Flex>
      ))}
    </Flex>
  ),
}

export const Colors: Story = {
  render: (props) => (
    <Flex>
      {textColorTokens.map((c) => (
        <Flex key={c} flexDirection="row" alignItems="center" mb={1}>
          <Typography variant="caption" width="6rem" flexShrink={0} m={0} color="secondary">
            {c}
          </Typography>
          <Link href="#" {...props} color={c}>
            {c}
          </Link>
        </Flex>
      ))}
    </Flex>
  ),
}

export const Variants: Story = {
  render: () => (
    <Flex>
      {typographyVariantTokens.map((v) => (
        <Flex key={v} flexDirection="row" alignItems="center" mb={1}>
          <Typography variant="caption" color="secondary" width="6rem" flexShrink={0} m={0}>
            {v}
          </Typography>
          <Link href="#" variant={v} m={0}>
            {v} link
          </Link>
        </Flex>
      ))}
    </Flex>
  ),
}

export const InlineProse: Story = {
  render: () => (
    <Typography variant="body1" maxWidth="480px">
      The design system is built with <Link href="#">Emotion</Link> and{' '}
      <Link href="#">styled-system</Link>. All components resolve color, spacing, and typography
      from theme tokens — see the{' '}
      <Link href="#" underline="hover" color="secondary">
        design-system docs
      </Link>{' '}
      for details.
    </Typography>
  ),
}
