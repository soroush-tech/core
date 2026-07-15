import type { Meta, StoryObj } from '@storybook/react-vite'
import { textColorTokens } from '../utils/test/storiesOptions'
import { Icon } from './Icon'
import { icons } from './icons'

const iconNames = Object.keys(icons)

const meta: Meta<typeof Icon> = {
  title: 'Theme/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      include: ['name', 'color', 'size'],
    },
  },
  args: {
    name: 'hub',
    color: 'primary',
    size: '3rem',
  },
  argTypes: {
    name: {
      control: { type: 'select' },
      options: iconNames,
      description: 'Registry key of the icon to render.',
      table: { category: 'Content' },
    },
    color: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Icon color — resolves from `theme.text` and fills the SVG via `currentColor`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'text',
      description: 'Sets both width and height — any valid CSS length.',
      table: { category: 'Layout', defaultValue: { summary: '1.5rem' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {}

export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Icon name="hub" color="primary" size="3rem" />
      <Icon name="hub" color="secondary" size="3rem" />
      <Icon name="hub" color="initial" size="3rem" />
    </div>
  ),
}

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', maxWidth: '480px' }}>
      {iconNames.map((name) => (
        <Icon key={name} name={name as keyof typeof icons} color="primary" size="2rem" />
      ))}
    </div>
  ),
}
