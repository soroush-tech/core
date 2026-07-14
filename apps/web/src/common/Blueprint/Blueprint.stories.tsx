import type { Meta, StoryObj } from '@storybook/react-vite'
import { height } from '@soroush.tech/design-system/utils/test/storiesArgs'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Blueprint } from './Blueprint'

const blueprintVariantTokens = ['line', 'dot'] as const

const meta = {
  title: 'Common/Blueprint',
  component: Blueprint,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A full-bleed background canvas with a CSS grid-line (or dot) decoration, an optional ' +
          'scanline sweep, and a cursor-following spotlight. Extends [`Flex`](../Flex).',
      },
    },
    controls: {
      include: ['children', 'variant', 'scanline', 'spotlight', 'height'],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Content layered over the background canvas.',
      table: { category: 'Content' },
    },
    variant: {
      control: { type: 'inline-radio' },
      options: blueprintVariantTokens,
      description: 'Background pattern — intersecting lines or a radial dot grid.',
      table: { category: 'Visual', defaultValue: { summary: 'line' } },
    },
    scanline: {
      control: 'boolean',
      description: 'Renders a fixed scanline sweep animation over the grid.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    spotlight: {
      control: 'boolean',
      description: 'Cursor-following radial highlight over the viewport.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    height,
  },
} satisfies Meta<typeof Blueprint>

export default meta
type Story = StoryObj<typeof meta>

const label = (
  <Typography variant="h4" color="initial" p={4}>
    Blueprint backdrop
  </Typography>
)

export const Default: Story = {
  args: { height: '480px', spotlight: false, children: label },
}

export const Dots: Story = {
  args: { height: '480px', variant: 'dot', spotlight: false, children: label },
}

export const WithScanline: Story = {
  args: { height: '480px', scanline: true, spotlight: false, children: label },
}

export const WithSpotlight: Story = {
  args: { height: '480px', spotlight: true, children: label },
}
