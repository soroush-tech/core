import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  letterSpacingTokens,
  fontFamilyTokens,
} from '@soroush.tech/design-system/utils/test/storiesOptions'
import { gap, mb } from '@soroush.tech/design-system/utils/test/storiesArgs'
import { Eyebrow } from './Eyebrow'

const meta: Meta<typeof Eyebrow> = {
  title: 'Common/Eyebrow',
  component: Eyebrow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['children', 'letterSpacing', 'fontFamily', 'gap', 'mb'],
    },
  },
  args: {
    children: 'Principal Software Engineer',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Label text rendered next to the decorative rule.',
      table: { category: 'Content' },
    },
    letterSpacing: {
      control: { type: 'select' },
      options: letterSpacingTokens,
      description: 'Letter spacing — resolves from `theme.letterSpacings`.',
      table: { category: 'Typography', defaultValue: { summary: 'widest' } },
    },
    fontFamily: {
      control: { type: 'select' },
      options: fontFamilyTokens,
      description: 'Font family — resolves from `theme.fonts`.',
      table: { category: 'Typography', defaultValue: { summary: 'mono' } },
    },
    gap,
    mb,
  },
}

export default meta
type Story = StoryObj<typeof Eyebrow>

export const Default: Story = {}

export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Eyebrow typographyProps={{ color: 'primary' }}>Primary — default</Eyebrow>
      <Eyebrow typographyProps={{ color: 'secondary' }}>Secondary</Eyebrow>
      <Eyebrow typographyProps={{ color: 'initial' }}>Initial</Eyebrow>
    </div>
  ),
}

export const BeforeHeading: Story = {
  render: () => (
    <div>
      <Eyebrow mb={2}>Principal Software Engineer</Eyebrow>
      <h1 style={{ margin: 0, fontWeight: 700, fontSize: '3rem', textTransform: 'uppercase' }}>
        Building High-Performance Software Architectures
      </h1>
    </div>
  ),
}
