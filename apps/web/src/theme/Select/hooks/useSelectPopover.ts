import { useCallback, useState } from 'react'

export interface UseSelectPopoverParams {
  /** Controlled open state. When defined, the hook never toggles its own state. */
  open?: boolean
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
}

export interface UseSelectPopoverResult {
  open: boolean
  openMenu: () => void
  closeMenu: () => void
}

/**
 * Owns `Select`'s open state (controlled or uncontrolled) and fires the open/close
 * callbacks. Positioning is delegated to `Popover`.
 */
export function useSelectPopover({
  open: openProp,
  defaultOpen = false,
  onOpen,
  onClose,
}: UseSelectPopoverParams): UseSelectPopoverResult {
  const isControlled = openProp !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = isControlled ? openProp : uncontrolledOpen

  const openMenu = useCallback(() => {
    if (!isControlled) {
      setUncontrolledOpen(true)
    }
    onOpen?.()
  }, [isControlled, onOpen])

  const closeMenu = useCallback(() => {
    if (!isControlled) {
      setUncontrolledOpen(false)
    }
    onClose?.()
  }, [isControlled, onClose])

  return { open, openMenu, closeMenu }
}
