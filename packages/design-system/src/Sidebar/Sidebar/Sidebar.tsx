import { useId, useMemo, useState, type ReactNode } from 'react'
import { styled } from '@soroush.tech/design-system'
import { Flex, type FlexProps } from '@soroush.tech/design-system/Flex'
import { SidebarContext, type SidebarAnchor, type SidebarItemVariant } from '../SidebarContext'

export interface SidebarProps extends FlexProps {
  /**
   * Rail contents — `SidebarItem`s, but any node composes (a sponsor logo,
   * a footer, dividers, …). Items read the open state from `SidebarContext`.
   */
  children: ReactNode
  /**
   * Whether item labels are shown. Controlled — the toggle lives with the
   * consumer (typically a menu button in the app bar).
   */
  isOpen: boolean
  /** Screen edge the rail hugs — labels render away from it. Default: `'left'`. */
  anchor?: SidebarAnchor
  /** Default variant for every item — an item's own `variant` wins. Default: `'text'`. */
  variant?: SidebarItemVariant
  /** Rail width while open. Default: `'14rem'`. */
  expandedWidth?: string
  /** Rail width while collapsed (icons only). Default: `'3.5rem'`. */
  collapsedWidth?: string
  /**
   * Render a second column beside the rail holding the selected item's
   * `children`. Off by default, where children render inline in the item row
   * instead. Default: `false`.
   */
  hasPanel?: boolean
  /** Width of the panel column. Only meaningful with `hasPanel`. Default: `'18rem'`. */
  panelWidth?: string
  /**
   * Props for the panel column — any `Flex` prop, plus `as` to change its
   * element. Overrides `panelWidth` and the derived `aria-label`; its `id` and
   * ref stay owned by the rail, which needs them as the port target and the
   * `aria-controls` anchor.
   */
  panelProps?: Omit<FlexProps, 'children' | 'id'>
  /** Accessible name of the navigation landmark — required so multiple navs stay distinguishable. */
  'aria-label': string
}

interface SidebarRailProps {
  isOpen?: boolean
  expandedWidth?: string
  collapsedWidth?: string
}

// The landmark and the shared surface. It holds no width of its own, so it is
// sized by what it contains — the rail alone, or the rail plus the panel — which
// is what lets `bg` and the rest of the Flex props cover both columns.
const SidebarRoot = styled(Flex, {
  name: 'Sidebar',
  label: 'Sidebar',
})({ minHeight: 0 })

// The animating rail. Width swaps between the two fixed values so the
// transition interpolates; labels overflow-hide while it moves. Separate from
// the root so the panel beside it is not clipped by the rail's own width.
const SidebarRail = styled(Flex, {
  name: 'Sidebar',
  slot: 'rail',
  label: 'SidebarRail',
  shouldForwardProp: (prop) =>
    prop !== 'isOpen' && prop !== 'expandedWidth' && prop !== 'collapsedWidth',
})<SidebarRailProps>(({ isOpen, expandedWidth, collapsedWidth }) => ({
  width: isOpen ? expandedWidth : collapsedWidth,
  transition: 'width 200ms ease',
  overflowX: 'hidden',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
}))

// The panel column — the portal target the selected item renders into, so it is
// always mounted while `hasPanel`. `:empty` collapses it when nothing has been
// ported in, which spares the rail an empty column without the panel having to
// be told whether any item holds content.
const SidebarPanelRoot = styled(Flex, {
  name: 'Sidebar',
  slot: 'panel',
  label: 'SidebarPanel',
})({
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'auto',
  '&:empty': { display: 'none' },
})

/**
 * A collapsible vertical icon rail: collapsed it shows icon-only items; open
 * it also shows each item's label, rendered away from the anchored edge.
 * Purely controlled via `isOpen` — pair it with a menu button wherever your
 * layout keeps one (usually the app bar). Children consume the state through
 * `SidebarContext`, and any `Flex` prop (`bg`, spacing, …) applies to the rail.
 *
 * With `hasPanel`, the rail gains a second column and the selected item's
 * `children` render there instead of inside its row — an icon rail beside a
 * detail panel. The panel appears only when the selected item has children, and
 * is independent of `isOpen`, so a collapsed icons-only rail can sit beside an
 * open panel.
 */
export function Sidebar({
  children,
  isOpen,
  anchor = 'left',
  variant = 'text',
  expandedWidth = '14rem',
  collapsedWidth = '3.5rem',
  hasPanel = false,
  panelWidth = '18rem',
  panelProps,
  'aria-label': ariaLabel,
  ...rest
}: Readonly<SidebarProps>) {
  const panelId = useId()
  // The panel's DOM node is the portal container, so it has to be state rather
  // than a ref — items need a re-render once it exists to port into it.
  const [panelNode, setPanelNode] = useState<HTMLElement | null>(null)
  // Only the selected item's label, published so the panel can be named after
  // it. The content itself is ported, never lifted.
  const [panelLabel, setPanelLabel] = useState<string | null>(null)

  const context = useMemo(
    () => ({ isOpen, anchor, variant, hasPanel, panelId, panelNode, setPanelLabel }),
    [isOpen, anchor, variant, hasPanel, panelId, panelNode]
  )

  // The panel lives inside the root, so the root's `bg` (and every other Flex
  // prop) covers both columns rather than stopping at the rail's edge. The rail
  // sits in its own element because its animating width would otherwise clip
  // the panel. Row direction follows `anchor`, putting the panel on the rail's
  // inner side.
  return (
    <SidebarRoot
      as="nav"
      aria-label={ariaLabel}
      flexDirection={anchor === 'right' ? 'row-reverse' : 'row'}
      flexShrink={0}
      {...rest}
    >
      <SidebarRail
        flexDirection="column"
        gap={1}
        flexShrink={0}
        isOpen={isOpen}
        expandedWidth={expandedWidth}
        collapsedWidth={collapsedWidth}
      >
        <SidebarContext.Provider value={context}>{children}</SidebarContext.Provider>
      </SidebarRail>
      {hasPanel && (
        <SidebarPanelRoot
          as="section"
          width={panelWidth}
          // Unnamed while empty, so an idle panel is not announced as a region.
          aria-label={panelLabel ?? undefined}
          {...panelProps}
          // After the consumer's props: the rail owns these. The ref is the port
          // target and the id is what the selected item's aria-controls points at.
          ref={setPanelNode}
          id={panelId}
        />
      )}
    </SidebarRoot>
  )
}
