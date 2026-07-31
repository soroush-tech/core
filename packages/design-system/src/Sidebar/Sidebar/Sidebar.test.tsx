import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '@soroush.tech/design-system/utils/test/renderWithTheme'
import { baseTheme } from '@soroush.tech/design-system/theme'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Sidebar } from './Sidebar'
import { SidebarItem } from '../SidebarItem'

describe('Sidebar', () => {
  it('renders a labeled navigation landmark with arbitrary children', () => {
    renderWithTheme(
      <Sidebar aria-label="Editor panels" isOpen={false}>
        <SidebarItem icon="folder" label="Directory" />
        <Typography m={0}>Sponsored</Typography>
      </Sidebar>
    )
    expect(screen.getByRole('navigation', { name: 'Editor panels' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Directory' })).toBeInTheDocument()
    // Non-item children compose freely (logos, footers, …).
    expect(screen.getByText('Sponsored')).toBeInTheDocument()
  })

  it('shows item labels only while open', () => {
    const { rerender } = renderWithTheme(
      <Sidebar aria-label="Panels" isOpen={false}>
        <SidebarItem icon="folder" label="Directory" />
      </Sidebar>
    )
    expect(screen.queryByText('Directory')).not.toBeInTheDocument()

    rerender(
      <Sidebar aria-label="Panels" isOpen>
        <SidebarItem icon="folder" label="Directory" />
      </Sidebar>
    )
    expect(screen.getByText('Directory')).toBeInTheDocument()
  })

  it('animates between the collapsed and expanded widths', () => {
    // The width sits on the rail inside the landmark, not on the landmark
    // itself — the root is sized by its contents so its background can span the
    // panel column too.
    const rail = () => screen.getByRole('navigation', { name: 'Panels' }).firstElementChild

    const { rerender } = renderWithTheme(
      <Sidebar aria-label="Panels" isOpen={false}>
        <SidebarItem icon="folder" label="Directory" />
      </Sidebar>
    )
    expect(rail()).toHaveStyle({ width: '3.5rem' })

    rerender(
      <Sidebar aria-label="Panels" isOpen expandedWidth="12rem">
        <SidebarItem icon="folder" label="Directory" />
      </Sidebar>
    )
    expect(rail()).toHaveStyle({ width: '12rem' })
  })

  it('passes its variant down to items, letting an explicit item variant win', () => {
    renderWithTheme(
      <Sidebar aria-label="Panels" isOpen variant="outlined">
        <SidebarItem icon="folder" label="Directory" isSelected />
        <SidebarItem icon="history" label="Gist history" variant="plain" isSelected />
      </Sidebar>
    )
    // Inherited outlined: accent border on selection.
    expect(screen.getByRole('button', { name: 'Directory' })).toHaveStyle({
      borderColor: baseTheme.palette.primary.main,
    })
    // Explicit plain overrides the rail: no fill, no accent border.
    const plain = screen.getByRole('button', { name: 'Gist history' })
    expect(plain).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0)' })
    expect(plain).not.toHaveStyle({ borderColor: baseTheme.palette.primary.main })
  })

  describe('hasPanel', () => {
    const rail = (props: { isOpen?: boolean; anchor?: 'left' | 'right' } = {}) => (
      <Sidebar aria-label="Panels" isOpen={props.isOpen ?? true} anchor={props.anchor} hasPanel>
        <SidebarItem icon="folder" label="Directory" isSelected>
          <p>Directory tree</p>
        </SidebarItem>
        <SidebarItem icon="history" label="Gist history">
          <p>Gist list</p>
        </SidebarItem>
      </Sidebar>
    )

    it('renders the selected item’s children in a panel named after it', () => {
      renderWithTheme(rail())
      const panel = screen.getByRole('region', { name: 'Directory' })
      expect(panel).toContainElement(screen.getByText('Directory tree'))
      // Only the selected item's children — the others stay unrendered.
      expect(screen.queryByText('Gist list')).not.toBeInTheDocument()
    })

    it('keeps the label in the item row rather than its children', () => {
      renderWithTheme(rail())
      const item = screen.getByRole('button', { name: 'Directory' })
      expect(item).toHaveTextContent('Directory')
      // The children moved to the panel, so the row must not also carry them.
      expect(item).not.toContainElement(screen.getByText('Directory tree'))
    })

    it('exposes the selected item as a disclosure pointing at its panel', () => {
      renderWithTheme(rail())
      const selected = screen.getByRole('button', { name: 'Directory' })
      const unselected = screen.getByRole('button', { name: 'Gist history' })
      expect(selected).toHaveAttribute('aria-expanded', 'true')
      expect(selected).toHaveAttribute(
        'aria-controls',
        screen.getByRole('region', { name: 'Directory' }).id
      )
      expect(unselected).toHaveAttribute('aria-expanded', 'false')
      // The panel does not exist for an unselected item, so nothing to point at.
      expect(unselected).not.toHaveAttribute('aria-controls')
    })

    it('shows the panel while the rail is collapsed', () => {
      renderWithTheme(rail({ isOpen: false }))
      expect(screen.getByText('Directory tree')).toBeInTheDocument()
    })

    it('renders no panel when nothing is selected or the selection has no children', () => {
      const { rerender } = renderWithTheme(
        <Sidebar aria-label="Panels" isOpen hasPanel>
          <SidebarItem icon="folder" label="Directory">
            <p>Directory tree</p>
          </SidebarItem>
        </Sidebar>
      )
      expect(screen.queryByRole('region')).not.toBeInTheDocument()

      rerender(
        <Sidebar aria-label="Panels" isOpen hasPanel>
          <SidebarItem icon="folder" label="Directory" isSelected />
        </Sidebar>
      )
      expect(screen.queryByRole('region')).not.toBeInTheDocument()
    })

    it('ports from items at any depth, not just direct children', () => {
      // The item ports its own children, so it needs no particular position in
      // the rail — a consumer's wrapper component works the same as a bare item.
      const Group = ({ children }: { children: React.ReactNode }) => (
        <div className="group">Group heading{children}</div>
      )

      renderWithTheme(
        <Sidebar aria-label="Panels" isOpen hasPanel>
          <>
            <Group>
              <SidebarItem icon="folder" label="Directory" isSelected>
                <p>Directory tree</p>
              </SidebarItem>
            </Group>
          </>
        </Sidebar>
      )
      const panel = screen.getByRole('region', { name: 'Directory' })
      expect(panel).toContainElement(screen.getByText('Directory tree'))
    })

    it('ports the content out of the item’s own DOM subtree', () => {
      renderWithTheme(rail())
      const item = screen.getByRole('button', { name: 'Directory' })
      const content = screen.getByText('Directory tree')
      // Declared inside the item, rendered inside the panel.
      expect(item).not.toContainElement(content)
      expect(screen.getByRole('region', { name: 'Directory' })).toContainElement(content)
    })

    it('hands the panel over when the selection moves', () => {
      const { rerender } = renderWithTheme(rail())
      expect(screen.getByRole('region', { name: 'Directory' })).toBeInTheDocument()

      rerender(
        <Sidebar aria-label="Panels" isOpen hasPanel>
          <SidebarItem icon="folder" label="Directory">
            <p>Directory tree</p>
          </SidebarItem>
          <SidebarItem icon="history" label="Gist history" isSelected>
            <p>Gist list</p>
          </SidebarItem>
        </Sidebar>
      )
      // The name follows the new owner, and only its content is mounted.
      expect(screen.getByRole('region', { name: 'Gist history' })).toContainElement(
        screen.getByText('Gist list')
      )
      expect(screen.queryByText('Directory tree')).not.toBeInTheDocument()
    })

    it('puts the panel on the rail’s inner side for each anchor', () => {
      const { rerender } = renderWithTheme(rail({ anchor: 'left' }))
      expect(screen.getByRole('navigation', { name: 'Panels' })).toHaveStyle({
        flexDirection: 'row',
      })

      rerender(rail({ anchor: 'right' }))
      expect(screen.getByRole('navigation', { name: 'Panels' })).toHaveStyle({
        flexDirection: 'row-reverse',
      })
    })

    it('passes panelProps to the panel, keeping the id and port target its own', () => {
      renderWithTheme(
        <Sidebar
          aria-label="Panels"
          isOpen
          hasPanel
          panelWidth="18rem"
          panelProps={{ as: 'aside', bg: 'paper', p: 3, width: '24rem' }}
        >
          <SidebarItem icon="folder" label="Directory" isSelected>
            <p>Directory tree</p>
          </SidebarItem>
        </Sidebar>
      )
      const panel = screen.getByRole('complementary', { name: 'Directory' })
      expect(panel).toHaveStyle({ backgroundColor: '#131313' })
      // The consumer's width wins over panelWidth.
      expect(panel).toHaveStyle({ width: '24rem' })
      // The port still lands, so the rail kept its ref and id.
      expect(panel).toContainElement(screen.getByText('Directory tree'))
      expect(screen.getByRole('button', { name: 'Directory' })).toHaveAttribute(
        'aria-controls',
        panel.id
      )
    })

    it('keeps the panel inside the landmark so the rail’s background covers it', () => {
      renderWithTheme(rail())
      const nav = screen.getByRole('navigation', { name: 'Panels' })
      // Sharing the background means sharing the box that paints it.
      expect(nav).toContainElement(screen.getByRole('region', { name: 'Directory' }))
    })

    it('keeps children inline in the row when the mode is off', () => {
      renderWithTheme(
        <Sidebar aria-label="Panels" isOpen>
          <SidebarItem icon="folder" label="Directory" isSelected>
            <p>Directory tree</p>
          </SidebarItem>
        </Sidebar>
      )
      expect(screen.queryByRole('region')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Directory' })).toContainElement(
        screen.getByText('Directory tree')
      )
    })
  })

  it('applies Flex props such as bg to the rail', () => {
    renderWithTheme(
      <Sidebar aria-label="Panels" isOpen={false} bg="paper" data-testid="rail">
        <SidebarItem icon="folder" label="Directory" onSelect={vi.fn()} />
      </Sidebar>
    )
    expect(screen.getByTestId('rail')).toHaveStyle({ backgroundColor: '#131313' })
  })
})
