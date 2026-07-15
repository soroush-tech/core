import { useEffect, useRef, type ReactNode } from 'react'
import { styled } from '../index'

// Named styled root — the trap wrapper is theme-customizable via
// `theme.components.FocusTrap.styleOverrides.root`. `outline: none` stays the
// base since the wrapper itself is focused only as a programmatic fallback.
const FocusTrapRoot = styled('div', { name: 'FocusTrap', label: 'FocusTrap' })({
  outline: 'none',
})

export interface FocusTrapProps {
  /** The content whose focusable descendants are trapped. */
  children: ReactNode
  /** When false, focus is neither moved nor trapped (e.g. a non-top modal). */
  isEnabled?: boolean
  /** Move focus into the trap when it activates. */
  shouldAutoFocus?: boolean
  /** Keep Tab / Shift+Tab cycling within the trap. */
  shouldTrapFocus?: boolean
  /** Pull focus back inside whenever it escapes the trap (e.g. a click outside). */
  shouldEnforceFocus?: boolean
  /** Restore focus to the previously focused element when the trap deactivates. */
  shouldRestoreFocus?: boolean
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(node: HTMLElement): HTMLElement[] {
  // A node can match the selector yet be untabbable (e.g. `<button tabindex="-1">`),
  // so drop anything pulled out of the sequential tab order.
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0
  )
}

/** Move focus to the first focusable descendant, or the node itself when there is none. */
function focusFirst(node: HTMLElement) {
  const [first] = getFocusable(node)
  ;(first ?? node).focus()
}

/**
 * @description Keeps keyboard focus within its children while active. Moves focus
 * in on activation, cycles Tab / Shift+Tab at the boundaries, pulls focus back when
 * it escapes, and restores focus to the previously focused element on deactivation.
 */
export function FocusTrap({
  children,
  isEnabled = true,
  shouldAutoFocus = true,
  shouldTrapFocus = true,
  shouldEnforceFocus = true,
  shouldRestoreFocus = true,
}: Readonly<FocusTrapProps>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isEnabled) {
      return
    }
    const node = rootRef.current!
    const doc = node.ownerDocument
    previouslyFocused.current = doc.activeElement as HTMLElement
    if (shouldAutoFocus) {
      focusFirst(node)
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (!node.contains(event.target as Node)) {
        focusFirst(node)
      }
    }
    if (shouldEnforceFocus) {
      doc.addEventListener('focusin', handleFocusIn)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!shouldTrapFocus || event.key !== 'Tab') {
        return
      }
      const focusable = getFocusable(node)
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable.at(-1)!
      const active = doc.activeElement
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    node.addEventListener('keydown', handleKeyDown)

    return () => {
      doc.removeEventListener('focusin', handleFocusIn)
      node.removeEventListener('keydown', handleKeyDown)
      if (shouldRestoreFocus) {
        previouslyFocused.current!.focus()
      }
    }
  }, [isEnabled, shouldAutoFocus, shouldEnforceFocus, shouldRestoreFocus, shouldTrapFocus])

  return (
    <FocusTrapRoot ref={rootRef} tabIndex={-1}>
      {children}
    </FocusTrapRoot>
  )
}
