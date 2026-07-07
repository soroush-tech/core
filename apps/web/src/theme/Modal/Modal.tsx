import { type ReactNode } from 'react'
import { styled, createShouldForwardProp, type Theme } from 'src/theme'
import { View } from 'src/theme/View'
import { Portal } from 'src/theme/Portal'
import { Backdrop } from 'src/theme/Backdrop'
import { FocusTrap } from 'src/theme/FocusTrap'
import { useModal, type ModalCloseReason } from 'src/theme/Modal/useModal'

export type ModalScroll = 'paper' | 'body'

export interface ModalProps {
  /** If true, the modal is shown. */
  isOpen: boolean
  /** A single content element. */
  children: ReactNode
  /** Fired on Escape (top modal only) or backdrop click. */
  onClose?: (event: Event | React.SyntheticEvent, reason: ModalCloseReason) => void
  /** Render the dimmed backdrop. Default: true. */
  hasBackdrop?: boolean
  /** Keep the children mounted while closed. Default: false. */
  shouldKeepMounted?: boolean
  /** Portal the modal into `portalContainer`. Default: true. */
  shouldUsePortal?: boolean
  /** Portal target, or a function returning one. Defaults to the document body. */
  portalContainer?: HTMLElement | (() => HTMLElement | null) | null
  /** Lock body scroll while open. Default: true. */
  shouldLockScroll?: boolean
  /** Skip `aria-hidden` on background content — for non-modal popovers whose trigger stays focused. Default: false. */
  disableAriaHidden?: boolean
  /** Move focus into the modal on open. Default: true. */
  shouldAutoFocus?: boolean
  /** Trap Tab focus within the modal. Default: true. */
  shouldTrapFocus?: boolean
  /** Pull focus back into the modal whenever it escapes. Default: true. */
  shouldEnforceFocus?: boolean
  /** Restore focus to the trigger on close. Default: true. */
  shouldRestoreFocus?: boolean
  /** How long content scrolls: within the content (`'paper'`) or the whole root (`'body'`). Default: 'paper'. */
  scroll?: ModalScroll
  /** Stacking layer from `theme.zOrder`. Default: 'modal'. */
  layer?: keyof Theme['zOrder']
}

const shouldForwardProp = createShouldForwardProp(['scroll', 'layer'])

const ModalRoot = styled(View, { label: 'Modal', shouldForwardProp })<{
  scroll: ModalScroll
  layer: keyof Theme['zOrder']
}>(({ theme, scroll, layer }) => ({
  position: 'fixed',
  inset: 0,
  zIndex: theme.zOrder[layer],
  display: 'flex',
  // The Backdrop is `position: fixed`, so it stays a full-viewport scrim and is
  // unaffected by this flex layout regardless of scroll mode.
  ...(scroll === 'paper'
    ? // Centre the content; it scrolls within the consumer's surface.
      { alignItems: 'center', justifyContent: 'center' }
    : // The root itself scrolls. `margin: auto` centres short content but collapses
      // instead of clipping when the content is taller than the viewport.
      {
        flexDirection: 'column',
        overflowY: 'auto',
        '& > :not([aria-hidden="true"])': { margin: 'auto' },
      }),
}))

/**
 * @description Accessible overlay primitive: portals its content, dims the page,
 * traps focus, locks scroll, and closes on Escape or backdrop click. The base for
 * higher-level overlays such as Drawer.
 */
export function Modal({
  isOpen,
  children,
  onClose,
  hasBackdrop = true,
  shouldKeepMounted = false,
  shouldUsePortal = true,
  portalContainer,
  shouldLockScroll = true,
  disableAriaHidden = false,
  shouldAutoFocus = true,
  shouldTrapFocus = true,
  shouldEnforceFocus = true,
  shouldRestoreFocus = true,
  scroll = 'paper',
  layer = 'modal',
}: Readonly<ModalProps>) {
  const { getRootProps, getBackdropProps } = useModal({
    isOpen,
    onClose,
    container: portalContainer,
    disableScrollLock: !shouldLockScroll,
    disableAriaHidden,
  })

  if (!shouldKeepMounted && !isOpen) {
    return null
  }

  // `open` is meant for a Backdrop transition we don't use; drop it from the DOM props.
  const { open: _open, ...backdropProps } = getBackdropProps()

  const content = (
    <ModalRoot scroll={scroll} layer={layer} {...getRootProps()}>
      {hasBackdrop ? <Backdrop {...backdropProps} /> : null}
      <FocusTrap
        isEnabled={isOpen}
        shouldAutoFocus={shouldAutoFocus}
        shouldTrapFocus={shouldTrapFocus}
        shouldEnforceFocus={shouldEnforceFocus}
        shouldRestoreFocus={shouldRestoreFocus}
      >
        {children}
      </FocusTrap>
    </ModalRoot>
  )

  return shouldUsePortal ? <Portal container={portalContainer}>{content}</Portal> : content
}
