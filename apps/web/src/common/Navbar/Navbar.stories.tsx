import type { Meta, StoryObj } from '@storybook/react-vite'
import { gap } from '@soroush.tech/design-system/utils/test/storiesArgs'
import { typographyVariantTokens } from '@soroush.tech/design-system/utils/test/storiesOptions'
import { Navbar } from './Navbar'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/articles', label: 'Articles' },
]

const meta = {
  title: 'Common/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['direction', 'gap', 'variant'],
    },
  },
  argTypes: {
    direction: {
      control: { type: 'inline-radio' },
      options: ['horizontal', 'vertical'] as const,
      description: 'Layout direction of the nav container.',
      table: { category: 'Layout', defaultValue: { summary: 'horizontal' } },
    },
    gap,
    variant: {
      control: { type: 'select' },
      options: typographyVariantTokens,
      description: 'Typographic scale forwarded to each NavLink.',
      table: { category: 'Typography', defaultValue: { summary: 'inherit' } },
    },
  },
  args: {
    items: NAV_ITEMS,
  },
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: { urlPathname: '/nowhere' },
  args: { direction: 'horizontal', gap: 4, variant: 'button' },
}

export const WithActiveLink: Story = {
  parameters: { urlPathname: '/about' },
  args: { direction: 'horizontal', gap: 4, variant: 'button' },
}
