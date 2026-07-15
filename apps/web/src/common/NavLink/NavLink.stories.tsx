import type { Meta, StoryObj } from '@storybook/react-vite'
import { m, p } from '@soroush.tech/design-system/utils/test/storiesArgs'
import { typographyVariantTokens } from '@soroush.tech/design-system/utils/test/storiesOptions'
import { NavLink } from './NavLink'

const meta = {
  title: 'Common/NavLink',
  component: NavLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: ['children', 'href', 'variant', 'm', 'p'],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Link label.',
      table: { category: 'Content' },
    },
    href: {
      control: 'text',
      description: 'URL to navigate to. Drives active-state detection.',
      table: { category: 'Content' },
    },
    variant: {
      control: { type: 'select' },
      options: typographyVariantTokens,
      description: 'Typographic scale.',
      table: { category: 'Typography', defaultValue: { summary: 'inherit' } },
    },
    color: {
      description:
        'Controlled by active state — not configurable. Active: `primary`, Inactive: `secondary`.',
      table: { category: 'Visual', disable: true },
    },
    m,
    p,
  },
} satisfies Meta<typeof NavLink>

export default meta
type Story = StoryObj<typeof meta>

export const Inactive: Story = {
  parameters: { urlPathname: '/' },
  args: { href: '/about', children: 'About', variant: 'button' },
}

export const Active: Story = {
  parameters: { urlPathname: '/about' },
  args: { href: '/about', children: 'About', variant: 'button' },
}

export const ActiveHome: Story = {
  parameters: { urlPathname: '/' },
  args: { href: '/', children: 'Home', variant: 'button' },
}

export const ActiveSubpath: Story = {
  parameters: { urlPathname: '/articles/hello-world' },
  args: { href: '/articles', children: 'Articles', variant: 'caption' },
}

export const UndefinedHref: Story = {
  parameters: { urlPathname: '/' },
  args: { href: undefined, children: 'No destination', variant: 'caption' },
}
