import type { Meta, StoryObj } from '@storybook/react-vite'
import { icons } from '../../Icon/icons'
import { Sidebar } from '../Sidebar'
import { SidebarItem } from './SidebarItem'

const iconNames = Object.keys(icons)

const meta: Meta<typeof SidebarItem> = {
  title: 'Theme/Sidebar/SidebarItem',
  component: SidebarItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['icon', 'label', 'variant', 'isSelected', 'disabled'] },
  },
  args: {
    icon: 'folder',
    label: 'Directory',
    variant: 'text',
  },
  argTypes: {
    icon: {
      control: 'select',
      options: iconNames,
      description: 'Icon shown in both the collapsed and open states.',
      table: { category: 'Content' },
    },
    label: {
      control: 'text',
      description: 'Accessible name; also the default visible content while open.',
      table: { category: 'Content' },
    },
    variant: {
      control: 'radio',
      options: ['text', 'outlined', 'plain'],
      description:
        'Borderless (`text`), bordered (`outlined`), or `plain` — no fill or hover feedback.',
      table: { category: 'Visual' },
    },
    isSelected: {
      control: 'boolean',
      description: 'Active state — drives `aria-pressed` and the selected fill.',
      table: { category: 'State' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the item.',
      table: { category: 'State' },
    },
  },
  // Items live inside a Sidebar — it provides the open/anchor context.
  render: (args) => (
    <Sidebar aria-label="Panels" isOpen>
      <SidebarItem {...args} />
    </Sidebar>
  ),
}

export default meta
type Story = StoryObj<typeof SidebarItem>

export const Default: Story = {}

export const Selected: Story = {
  args: { isSelected: true, icon: 'terminal', label: 'Terminal console' },
}

export const Outlined: Story = {
  args: { variant: 'outlined', icon: 'history', label: 'Gist history' },
}

// Custom children replace the label text while open; the label stays the
// accessible name.
export const WithChildren: Story = {
  args: { icon: 'edit_note', label: 'Drafts' },
  render: (args) => (
    <Sidebar aria-label="Panels" isOpen>
      <SidebarItem {...args}>
        <span>Drafts (3)</span>
      </SidebarItem>
    </Sidebar>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, icon: 'history', label: 'Gist history' },
}
