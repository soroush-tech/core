import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { bg } from '@soroush.tech/design-system/utils/test/storiesArgs'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Sidebar } from './Sidebar'
import { SidebarItem } from '../SidebarItem'

const meta: Meta<typeof Sidebar> = {
  title: 'Theme/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'isOpen',
        'anchor',
        'variant',
        'expandedWidth',
        'collapsedWidth',
        'hasPanel',
        'panelWidth',
        'bg',
        'aria-label',
      ],
    },
  },
  args: {
    isOpen: false,
    anchor: 'left',
    'aria-label': 'Editor panels',
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description:
        'Whether item labels are shown. Controlled by the consumer (e.g. an app-bar menu button).',
      table: { category: 'Layout' },
    },
    anchor: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'Screen edge the rail hugs — labels render away from it.',
      table: { category: 'Layout' },
    },
    variant: {
      control: 'radio',
      options: ['text', 'outlined', 'plain'],
      description: "Default variant for every item — an item's own `variant` wins.",
      table: { category: 'Visual', defaultValue: { summary: 'text' } },
    },
    expandedWidth: {
      control: 'text',
      description: 'Rail width while open.',
      table: { category: 'Layout' },
    },
    collapsedWidth: {
      control: 'text',
      description: 'Rail width while collapsed (icons only).',
      table: { category: 'Layout' },
    },
    hasPanel: {
      control: 'boolean',
      description:
        "Render a second column holding the selected item's `children`. Off by default, where children render inline in the item row instead.",
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    panelWidth: {
      control: 'text',
      description: 'Width of the panel column. Only meaningful with `hasPanel`.',
      table: { category: 'Layout', defaultValue: { summary: '18rem' } },
    },
    panelProps: {
      control: false,
      description:
        'Props for the panel column — any `Flex` prop, plus `as`. Overrides `panelWidth` and the derived `aria-label`.',
      table: { category: 'Layout' },
    },
    bg,
    'aria-label': {
      control: 'text',
      description: 'Accessible name of the navigation landmark.',
      table: { category: 'Content' },
    },
  },
  render: (args) => (
    <Sidebar {...args}>
      <SidebarItem icon="folder" label="Directory" isSelected />
      <SidebarItem icon="history" label="Gist history" />
      <SidebarItem icon="edit_note" label="Drafts" />
      <SidebarItem icon="terminal" label="Terminal console" />
      <Typography variant="caption" color="secondary" p={2} mt="auto">
        v1.1.0
      </Typography>
    </Sidebar>
  ),
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const Default: Story = {}

export const Open: Story = {
  args: { isOpen: true },
}

// A right-anchored rail: open labels render to the left of their icons and
// content pins to the right edge.
export const RightAnchored: Story = {
  args: { anchor: 'right', isOpen: true },
}

export const Tinted: Story = {
  args: { isOpen: true, bg: 'paper' },
}

type SidebarArgs = Partial<ComponentProps<typeof Sidebar>>

const PANELS = [
  { id: 'directory', icon: 'folder', label: 'Directory', lines: ['README.md', 'notes.md'] },
  { id: 'gists', icon: 'history', label: 'Gist history', lines: ['snippet.ts', 'scratch.md'] },
  { id: 'drafts', icon: 'edit_note', label: 'Drafts', lines: ['Untitled', 'Release post'] },
] as const

// Selection is the consumer's, as everywhere else in this component — the rail
// only decides where the selected item's children are rendered.
const PanelDemo = (args: SidebarArgs) => {
  const [selected, setSelected] = useState<string | null>('directory')

  return (
    <Sidebar
      {...args}
      aria-label={args['aria-label'] ?? 'Editor panels'}
      isOpen={args.isOpen ?? false}
      hasPanel
    >
      {PANELS.map(({ id, icon, label, lines }) => (
        <SidebarItem
          key={id}
          icon={icon}
          label={label}
          isSelected={selected === id}
          onSelect={() => setSelected(selected === id ? null : id)}
        >
          <Flex flexDirection="column" gap={1} p={2}>
            <Typography variant="subtitle2" m={0}>
              {label}
            </Typography>
            {lines.map((line) => (
              <Typography key={line} variant="body2" color="secondary" m={0}>
                {line}
              </Typography>
            ))}
          </Flex>
        </SidebarItem>
      ))}
    </Sidebar>
  )
}

/**
 * With `hasPanel`, the selected item's children render in a second column
 * instead of inside its row. Click an item to switch panels, or click the
 * selected one again to close it — with nothing selected the column disappears
 * rather than leaving an empty gap.
 */
export const WithPanel: Story = {
  args: { isOpen: false, hasPanel: true },
  render: (args) => <PanelDemo {...args} />,
}

// The panel is independent of `isOpen`, so an icons-only rail can sit beside an
// open panel — and a right-anchored rail keeps the panel on its inner side.
export const PanelOpenRail: Story = {
  ...WithPanel,
  args: { isOpen: true, hasPanel: true },
}

export const PanelRightAnchored: Story = {
  ...WithPanel,
  args: { isOpen: true, hasPanel: true, anchor: 'right' },
}

// `panelProps` restyles or re-tags the column — here an `<aside>` on its own
// surface, wider than the default, separated from the rail by a rule.
export const PanelStyled: Story = {
  ...WithPanel,
  args: {
    isOpen: true,
    hasPanel: true,
    bg: 'grid',
    panelProps: { as: 'aside', bg: 'paper', width: '22rem', borderLeft: 'thin' },
  },
}
