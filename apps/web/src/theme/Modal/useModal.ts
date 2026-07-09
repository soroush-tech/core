import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  type RefCallback,
  type SyntheticEvent,
} from 'react'
import { ModalManager, type ManagedModal } from 'src/theme/Modal/ModalManager'
import { ownerDocument } from 'src/utils/ownerDocument'
import { useEventCallback } from 'src/theme/Modal/hooks/useEventCallback'
import { useMergedRefs } from 'src/theme/Modal/hooks/useMergedRefs'

export type ModalCloseReason = 'escapeKey' | 'backdropClick'

type EventHandlers = Record<string, ((event: SyntheticEvent) => void) | undefined>

export interface UseModalParameters {
  /** Whether the modal is shown. */
  isOpen: boolean
  /** Fired on Escape (top modal only) or backdrop click. */
  onClose?: (event: ReactKeyboardEvent | ReactMouseEvent, reason: ModalCloseReason) => void
  /** Portal container, or a function returning one. Defaults to the document body. */
  container?: HTMLElement | (() => HTMLElement | null) | null
  /** Disable body scroll-lock while open. */
  disableScrollLock?: boolean
  /** Skip `aria-hidden` on background siblings (for non-modal popovers). */
  disableAriaHidden?: boolean
  /** Forwarded ref for the modal root element. */
  rootRef?: Ref<Element>
}

export interface UseModalReturnValue {
  getRootProps: (otherHandlers?: EventHandlers) => Record<string, unknown>
  getBackdropProps: (otherHandlers?: EventHandlers) => Record<string, unknown>
  rootRef: RefCallback<Element> | null
  portalRef: (node: HTMLElement | null) => void
  isTopModal: () => boolean
}

// Modals never open during SSR, so a single client-side instance is safe to share.
const modalManager = new ModalManager()

function getContainer(container: UseModalParameters['container']): HTMLElement | null {
  return typeof container === 'function' ? container() : (container ?? null)
}

export function useModal(parameters: UseModalParameters): UseModalReturnValue {
  const {
    isOpen,
    onClose,
    container,
    disableScrollLock = false,
    disableAriaHidden = false,
    rootRef,
  } = parameters

  const modal = useRef<ManagedModal>({} as ManagedModal)
  const mountNodeRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef<HTMLElement | null>(null)
  const handleRef = useMergedRefs(modalRef, rootRef)

  const getModal = (): ManagedModal => {
    modal.current.modalRef = modalRef.current as Element
    modal.current.mount = mountNodeRef.current as Element
    return modal.current
  }

  const handleOpen = useEventCallback(() => {
    const resolvedContainer = getContainer(container) ?? ownerDocument(mountNodeRef.current).body
    modalManager.add(getModal(), resolvedContainer, disableAriaHidden)
    modalManager.mount(getModal(), { disableScrollLock })
  })

  const isTopModal = useEventCallback(() => modalManager.isTopModal(getModal()))

  const handlePortalRef = useEventCallback((node: HTMLElement | null) => {
    mountNodeRef.current = node
  })

  // Remove the already-registered modal object directly. Re-reading refs here
  // would null them during unmount (refs detach before passive-effect cleanup).
  const handleClose = useEventCallback(() => {
    modalManager.remove(modal.current)
  })

  // Register the modal while open and re-register when the container or scroll-lock
  // option changes; the cleanup deregisters it on close, on those changes, and on
  // unmount, so scroll-lock / aria state always tracks the current target.
  useEffect(() => {
    if (!isOpen) {
      return
    }
    handleOpen()
    return () => handleClose()
  }, [isOpen, container, disableScrollLock, handleOpen, handleClose])

  const createHandleKeyDown =
    (otherHandlers: EventHandlers) => (event: ReactKeyboardEvent<Element>) => {
      otherHandlers.onKeyDown?.(event)

      // `which === 229` means an IME is still composing — wait for it to settle.
      if (event.key !== 'Escape' || event.which === 229 || !isTopModal()) {
        return
      }

      // Swallow it so a body-level Escape listener doesn't also fire.
      event.stopPropagation()
      onClose?.(event, 'escapeKey')
    }

  // The backdrop is `pointer-events: none`, so a click on the dimmed area lands on
  // the root itself. Closing only when target === currentTarget keeps clicks on the
  // content (a descendant) from dismissing the modal.
  const createHandleRootClick =
    (otherHandlers: EventHandlers) => (event: ReactMouseEvent<Element>) => {
      otherHandlers.onClick?.(event)

      if (event.target !== event.currentTarget) {
        return
      }

      onClose?.(event, 'backdropClick')
    }

  const getRootProps = (otherHandlers: EventHandlers = {}): Record<string, unknown> => {
    return {
      // role="presentation" tells assistive tech the wrapper itself isn't interactive.
      role: 'presentation',
      ...otherHandlers,
      onKeyDown: createHandleKeyDown(otherHandlers),
      onClick: createHandleRootClick(otherHandlers),
      ref: handleRef,
    }
  }

  const getBackdropProps = (otherHandlers: EventHandlers = {}): Record<string, unknown> => {
    return {
      'aria-hidden': true,
      ...otherHandlers,
      open: isOpen,
    }
  }

  return {
    getRootProps,
    getBackdropProps,
    rootRef: handleRef,
    portalRef: handlePortalRef,
    isTopModal,
  }
}
