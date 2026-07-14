import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react'
import { styled, useTheme, type Theme, createShouldForwardProp } from '../index'
import { Modal, type ModalCloseReason } from '../Modal'
import { Paper, type PaperProps, type PaperElevation } from '../Paper'
import { resolveAnchorEl, type PopoverAnchorEl } from './utils/resolveAnchorEl'
import {
  computePopoverPosition,
  type PopoverOrigin,
  type PopoverPosition,
  type PopoverReference,
} from './utils/computePopoverPosition'

export type { PopoverAnchorEl, PopoverOrigin, PopoverPosition, PopoverReference }

export interface PopoverActions {
  /** Recomputes the popover's position against its anchor. */
  updatePosition: () => void
}

export interface PopoverProps {
  /** If true, the popover is shown. */
  open: boolean
  /** The content of the popover. */
  children: ReactNode
  /** An element, or a function returning one, used to position the popover. */
  anchorEl?: PopoverAnchorEl
  /** Which anchor to position against. Default: `'anchorEl'`. */
  anchorReference?: PopoverReference
  /** Client coordinates used when `anchorReference` is `'anchorPosition'`. */
  anchorPosition?: PopoverPosition
  /** The point on the anchor the popover attaches to. Default: `{ vertical: 'top', horizontal: 'left' }`. */
  anchorOrigin?: PopoverOrigin
  /** The point on the popover that meets the anchor. Default: `{ vertical: 'top', horizontal: 'left' }`. */
  transformOrigin?: PopoverOrigin
  /** Fired on Escape (top layer) or a click outside the surface. */
  onClose?: (event: Event | React.SyntheticEvent, reason: ModalCloseReason) => void
  /** Shadow depth of the surface. Default: 8. */
  elevation?: PaperElevation
  /** Minimum gap from the viewport edge as a spacing token (resolved against `theme.space`, e.g. `2` → 16px); `null` disables clamping/flipping. Default: `2`. */
  marginThreshold?: Exclude<keyof Theme['space'], 'auto'> | null
  /** Portal target passed to the underlying Modal. */
  container?: HTMLElement | (() => HTMLElement | null) | null
  /** Ref for imperative actions — currently `updatePosition()`. */
  action?: Ref<PopoverActions>
  /** Props for the paper slot (the surface). */
  slotProps?: { paper?: PaperProps }
  /** Render the dimmed backdrop. Default: false (an invisible click-away layer via the Modal root). */
  hasBackdrop?: boolean
  /** Disable body scroll-lock. When true, the popover re-positions on scroll. Default: false. */
  disableScrollLock?: boolean
  /** Skip `aria-hidden` on background content — for non-modal popovers whose trigger stays focused. Default: false. */
  disableAriaHidden?: boolean
  /** Move focus into the popover on open. Default: true. */
  shouldAutoFocus?: boolean
  /** Trap Tab focus within the popover. Default: true. */
  shouldTrapFocus?: boolean
  /** Pull focus back whenever it escapes. Default: true. */
  shouldEnforceFocus?: boolean
  /** Restore focus to the trigger on close. Default: true. */
  shouldRestoreFocus?: boolean
  /** Keep the content mounted while closed. Default: false. */
  shouldKeepMounted?: boolean
  /** Stacking layer from `theme.zOrder`. Default: 'modal'. */
  layer?: keyof Theme['zOrder']
}

const ANCHOR_ORIGIN_DEFAULT: PopoverOrigin = { vertical: 'top', horizontal: 'left' }

// The measured, positioned wrapper. Kept transparent so the inner Paper owns the
// visuals — its rounded corners are never clipped. Hidden until first positioned.
const Positioner = styled('div', {
  shouldForwardProp: createShouldForwardProp(['isPositioned']),
})<{ isPositioned: boolean }>(({ isPositioned }) => ({
  position: 'absolute',
  ...(isPositioned ? {} : { opacity: 0 }),
}))

const Surface = styled(Paper)({
  overflowY: 'auto',
  overflowX: 'hidden',
  minWidth: 16,
  minHeight: 16,
  maxWidth: 'calc(100vw - 32px)',
  maxHeight: 'calc(100vh - 32px)',
  outline: 0,
})

/**
 * @description Positions its content next to an anchor, portaled above the page.
 * Built on `Modal`, so it inherits the portal, optional backdrop, focus management,
 * scroll lock, and Escape/click-away close — then adds anchor positioning
 * (`anchorOrigin`/`transformOrigin`/`marginThreshold`).
 */
export function Popover({
  open,
  children,
  anchorEl = null,
  anchorReference = 'anchorEl',
  anchorPosition,
  anchorOrigin = ANCHOR_ORIGIN_DEFAULT,
  transformOrigin = ANCHOR_ORIGIN_DEFAULT,
  onClose,
  elevation = 8,
  marginThreshold = 2,
  container,
  action,
  slotProps,
  hasBackdrop = false,
  disableScrollLock = false,
  disableAriaHidden = false,
  shouldAutoFocus = true,
  shouldTrapFocus = true,
  shouldEnforceFocus = true,
  shouldRestoreFocus = true,
  shouldKeepMounted = false,
  layer = 'modal',
}: Readonly<PopoverProps>) {
  const theme = useTheme()
  const positionerRef = useRef<HTMLDivElement>(null)
  const [isPositioned, setIsPositioned] = useState(false)

  const anchorTop = anchorPosition?.top
  const anchorLeft = anchorPosition?.left
  // Resolve the spacing token to pixels for the (px-based) positioning math.
  const marginThresholdPx =
    marginThreshold == null ? null : Number.parseFloat(String(theme.space[marginThreshold]))

  const setPositioningStyles = useCallback(() => {
    const element = positionerRef.current
    if (!element) {
      return
    }
    const resolved = resolveAnchorEl(anchorEl)
    const anchorRect =
      anchorReference === 'anchorEl' && resolved ? resolved.getBoundingClientRect() : null

    const positioning = computePopoverPosition({
      anchorReference,
      anchorRect,
      anchorPosition:
        anchorTop != null && anchorLeft != null ? { top: anchorTop, left: anchorLeft } : undefined,
      paperRect: { width: element.offsetWidth, height: element.offsetHeight },
      anchorOrigin,
      transformOrigin,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      marginThreshold: marginThresholdPx,
    })

    if (positioning.top !== null) {
      element.style.top = `${positioning.top}px`
    }
    if (positioning.left !== null) {
      element.style.left = `${positioning.left}px`
    }
    element.style.transformOrigin = positioning.transformOrigin
    setIsPositioned(true)
  }, [
    anchorEl,
    anchorReference,
    anchorTop,
    anchorLeft,
    anchorOrigin,
    transformOrigin,
    marginThresholdPx,
  ])

  // Re-run on every render while open so the surface tracks late size changes
  // (e.g. an anchor-width style applied by the consumer after mount). Runs before
  // paint, so a reopen re-positions with no flash even though `isPositioned` stays set.
  useLayoutEffect(() => {
    if (open) {
      setPositioningStyles()
    }
  })

  useEffect(() => {
    if (!open) {
      return undefined
    }
    const handle = () => setPositioningStyles()
    window.addEventListener('resize', handle)
    if (disableScrollLock) {
      window.addEventListener('scroll', handle, true)
    }
    return () => {
      window.removeEventListener('resize', handle)
      window.removeEventListener('scroll', handle, true)
    }
  }, [open, disableScrollLock, setPositioningStyles])

  useImperativeHandle(action, () => ({ updatePosition: setPositioningStyles }), [
    setPositioningStyles,
  ])

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      hasBackdrop={hasBackdrop}
      shouldKeepMounted={shouldKeepMounted}
      shouldLockScroll={!disableScrollLock}
      disableAriaHidden={disableAriaHidden}
      shouldAutoFocus={shouldAutoFocus}
      shouldTrapFocus={shouldTrapFocus}
      shouldEnforceFocus={shouldEnforceFocus}
      shouldRestoreFocus={shouldRestoreFocus}
      portalContainer={container}
      layer={layer}
    >
      <Positioner ref={positionerRef} isPositioned={isPositioned}>
        <Surface elevation={elevation} {...slotProps?.paper}>
          {children}
        </Surface>
      </Positioner>
    </Modal>
  )
}
