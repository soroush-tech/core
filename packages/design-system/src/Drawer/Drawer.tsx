import { type ReactNode } from 'react'
import { styled, keyframes, createShouldForwardProp } from '../index'
import { Paper, type PaperElevation } from '../Paper'
import { Modal, type ModalProps } from '../Modal'

export type DrawerAnchor = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps extends Pick<
  ModalProps,
  | 'isOpen'
  | 'onClose'
  | 'hasBackdrop'
  | 'shouldKeepMounted'
  | 'shouldUsePortal'
  | 'portalContainer'
  | 'shouldLockScroll'
  | 'shouldAutoFocus'
  | 'shouldTrapFocus'
  | 'shouldRestoreFocus'
> {
  /** The content of the drawer. */
  children: ReactNode
  /** Edge the drawer slides in from. Default: 'left'. */
  anchor?: DrawerAnchor
  /** Shadow depth of the panel (0–24), forwarded to Paper. Default: 16. */
  elevation?: PaperElevation
  /** Slide duration in milliseconds. Default: 225. */
  transitionDuration?: number
}

const slideIn: Record<DrawerAnchor, ReturnType<typeof keyframes>> = {
  left: keyframes`from { transform: translateX(-100%); } to { transform: translateX(0); }`,
  right: keyframes`from { transform: translateX(100%); } to { transform: translateX(0); }`,
  top: keyframes`from { transform: translateY(-100%); } to { transform: translateY(0); }`,
  bottom: keyframes`from { transform: translateY(100%); } to { transform: translateY(0); }`,
}

const anchorPosition: Record<DrawerAnchor, Record<string, string | number>> = {
  left: { top: 0, left: 0, bottom: 0, height: '100%' },
  right: { top: 0, right: 0, bottom: 0, height: '100%' },
  top: { top: 0, left: 0, right: 0, width: '100%' },
  bottom: { bottom: 0, left: 0, right: 0, width: '100%' },
}

interface DrawerPanelProps {
  anchor: DrawerAnchor
  duration: number
}

const shouldForwardProp = createShouldForwardProp(['anchor', 'duration'])

// Anchored, sliding surface. `position: fixed` lifts it out of Modal's centring
// flow so it pins to the chosen viewport edge. Honors reduced-motion preferences.
const DrawerPanel = styled(Paper, { label: 'Drawer', shouldForwardProp })<DrawerPanelProps>(
  ({ anchor, duration }) => ({
    position: 'fixed',
    ...anchorPosition[anchor],
    animation: `${slideIn[anchor]} ${duration}ms ease-out`,
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  })
)

/**
 * @description A panel that slides in from a screen edge, built on Modal. Portals,
 * dims the page, traps focus, locks scroll, and closes on Escape or backdrop click.
 */
export function Drawer({
  children,
  anchor = 'left',
  elevation = 16,
  transitionDuration = 225,
  ...modalProps
}: Readonly<DrawerProps>) {
  return (
    <Modal {...modalProps} layer="drawer">
      <DrawerPanel anchor={anchor} duration={transitionDuration} elevation={elevation}>
        {children}
      </DrawerPanel>
    </Modal>
  )
}
