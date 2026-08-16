import { useContext, useEffect, type ReactNode } from 'react'
import { Portal } from '@soroush.tech/design-system/Portal'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { SidebarContext } from '@soroush.tech/design-system/Sidebar'

export interface SidebarPanelItemProps {
  /** Row content in the rail - any node, which is the reason this is not a `SidebarItem`. */
  icon: ReactNode
  /** Accessible name of the row, and the name given to the panel while it is open. */
  label: string
  isSelected: boolean
  onSelect: () => void
  /** Rendered in the rail's panel column while selected. */
  children: ReactNode
  /** Pushes the row to the far end of the rail. */
  atEnd?: boolean
}

/**
 * A rail row that opens the `Sidebar`'s panel column.
 *
 * `SidebarItem` takes its icon by registry name (`icon: IconName`), so a local
 * asset cannot go through it. This ports into the panel through the same
 * public `SidebarContext` contract `SidebarItem` uses, keeping the panel a
 * named region and the row a proper disclosure. Widening `SidebarItem.icon` to
 * accept a node upstream would make this component unnecessary.
 */
export function SidebarPanelItem({
  icon,
  label,
  isSelected,
  onSelect,
  children,
  atEnd,
}: Readonly<SidebarPanelItemProps>) {
  const { panelId, panelNode, setPanelLabel } = useContext(SidebarContext)

  // Only the name travels through context; the content itself is ported.
  useEffect(() => {
    if (!isSelected || !setPanelLabel) return
    setPanelLabel(label)
    return () => setPanelLabel(null)
  }, [isSelected, label, setPanelLabel])

  return (
    <>
      <Pressable
        as="button"
        type="button"
        feedback="highlight"
        p={2}
        mt={atEnd ? 'auto' : undefined}
        aria-label={label}
        aria-expanded={isSelected}
        aria-controls={isSelected ? panelId : undefined}
        onClick={onSelect}
      >
        {icon}
      </Pressable>
      {isSelected && panelNode && <Portal container={panelNode}>{children}</Portal>}
    </>
  )
}
