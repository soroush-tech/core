import type { Meta, StoryObj } from '@storybook/react-vite'
import * as colors from '../colors'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { ColorPalette } from './ColorPalette'

const paletteEntries = Object.entries(colors) as [string, Record<string | number, string>][]
const paletteNames = paletteEntries.map(([name]) => name)
const paletteMap = Object.fromEntries(paletteEntries)

const meta: Meta<{ paletteName: string }> = {
  title: 'Theme/ColorPalette',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['paletteName'],
    },
  },
  argTypes: {
    paletteName: {
      control: { type: 'select' },
      options: paletteNames,
      description: 'Color palette — select from all registered palettes.',
      table: { category: 'Content' },
    },
  },
  render: ({ paletteName }) => (
    <ColorPalette name={paletteName} palette={paletteMap[paletteName]} />
  ),
}

export default meta
type Story = StoryObj<{ paletteName: string }>

export const LightBase: Story = {
  args: { paletteName: 'kineticGreen' },
}

export const DarkBase: Story = {
  args: { paletteName: 'kineticSurface' },
}

export const AllPalettes: Story = {
  render: () => (
    <Flex flexDirection="row" flexWrap="wrap" gap={3}>
      {paletteEntries.map(([name, palette]) => (
        <Flex key={name} flexDirection="column" gap={1} alignItems="center">
          <ColorPalette name={name} palette={palette} />
          <Typography variant="caption" color="secondary" m={0}>
            {name}
          </Typography>
        </Flex>
      ))}
    </Flex>
  ),
}
