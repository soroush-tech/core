import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  buttonColorTokens,
  pressableFeedbackTokens,
} from '@soroush.tech/design-system/utils/test/storiesOptions'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Pressable } from './Pressable'

const meta: Meta<typeof Pressable> = {
  title: 'Theme/Pressable',
  component: Pressable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'as',
        'feedback',
        'color',
        'activeOpacity',
        'disabled',
        'href',
        'p',
        'borderRadius',
      ],
    },
  },
  args: {
    children: 'Press me',
  },
  argTypes: {
    as: {
      control: { type: 'inline-radio' },
      options: ['div', 'button', 'span'],
      description:
        'Element to render. `div` (default) and any other tag get button semantics via a ' +
        'role, tab stop, and Enter/Space handling; `button` is native.',
      table: { category: 'Behavior', defaultValue: { summary: 'div' } },
    },
    feedback: {
      control: { type: 'inline-radio' },
      options: pressableFeedbackTokens,
      description:
        'Feedback shown while held — `none` leaves the content untouched, `opacity` dims it, ' +
        '`highlight` tints the surface behind it.',
      table: { category: 'Behavior', defaultValue: { summary: 'none' } },
    },
    color: {
      control: { type: 'select' },
      options: buttonColorTokens,
      description: 'Palette the `highlight` tint derives from — resolves against `theme.palette`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    activeOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Opacity held content fades to under `feedback="opacity"`.',
      table: { category: 'Behavior', defaultValue: { summary: '0.7' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the surface — suppresses press feedback and the pointer cursor.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    href: {
      control: 'text',
      description: 'Renders an `a` element instead of a `button` when set.',
      table: { category: 'Behavior' },
    },
    p: {
      control: { type: 'select' },
      options: [0, 1, 2, 3, 4],
      description: 'Padding — resolves from `theme.space`. Zero by default, like every other box.',
      table: { category: 'Spacing', type: { summary: 'space' }, defaultValue: { summary: '0' } },
    },
    borderRadius: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Border radius — resolves from `theme.radii`. Clips the `highlight` tint.',
      table: { category: 'Visual', type: { summary: 'sm | md | lg' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof Pressable>

export const Default: Story = {}

export const Opacity: Story = {
  args: { feedback: 'opacity', children: 'Hold to dim' },
}

export const Highlight: Story = {
  args: { feedback: 'highlight', children: 'Hold to tint', p: 2, borderRadius: 'md' },
}

/** Wrapping arbitrary content: the surface adds semantics, not layout. */
export const WrappingContent: Story = {
  render: () => (
    <Pressable feedback="highlight" p={2} borderRadius="md" width="16rem">
      <Flex flexDirection="row" alignItems="center" gap={2} width="100%">
        <Icon name="folder" size="1.25rem" color="inherit" />
        <Typography as="span" variant="inherit" m={0}>
          Documents
        </Typography>
      </Flex>
    </Pressable>
  ),
}
