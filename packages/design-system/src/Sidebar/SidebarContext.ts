import { createContext } from 'react'

/** Screen edge a `Sidebar` hugs - item labels render away from that edge. */
export type SidebarAnchor = 'left' | 'right'

/**
 * Visual style of a `SidebarItem`: borderless (`text`, default), `outlined`, or
 * `plain` - no fill and no hover or press feedback, so selection reads through
 * the text color alone.
 */
export type SidebarItemVariant = 'outlined' | 'text' | 'plain'

/**
 * State provided by `Sidebar` and consumed by `SidebarItem`: whether labels
 * are shown, which side the rail hugs (decides the label side), the rail-wide
 * default item variant (an item's own `variant` wins), and whether the rail
 * renders a panel column - which decides where an item's `children` go.
 */
export interface SidebarContextValue {
  isOpen: boolean
  anchor: SidebarAnchor
  variant: SidebarItemVariant
  /** Whether the rail renders a panel column; items port their children into it. */
  hasPanel: boolean
  /** `id` of the panel element, so the selected item can point `aria-controls` at it. */
  panelId?: string
  /**
   * The panel's DOM node - the container the selected item ports its `children`
   * into. `null` until the panel has mounted, and whenever `hasPanel` is off.
   */
  panelNode?: HTMLElement | null
  /**
   * Publishes the porting item's `label` so the panel can be named after it.
   * Only the name travels through context; the content itself is ported.
   */
  setPanelLabel?: (label: string | null) => void
}

export const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  anchor: 'left',
  variant: 'text',
  hasPanel: false,
})
