import { useEffect, useRef } from 'react'

/**
 * Tracks the cursor and exposes its position to CSS via `--spotlight-x` /
 * `--spotlight-y` custom properties on the returned element. A styled overlay
 * reads them to render a radial-gradient that follows the pointer.
 *
 * Mutating CSS variables (rather than React state) avoids re-rendering on every
 * mouse move. SSR-safe: the listener is only attached inside the effect. Pass
 * `enabled={false}` (e.g. a Blueprint with `spotlight={false}`) to skip the
 * listener entirely.
 */
export function useSpotlight<T extends HTMLElement = HTMLDivElement>(enabled = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!enabled) return
    const handleMove = (event: MouseEvent) => {
      const element = ref.current
      if (!element) return
      element.style.setProperty('--spotlight-x', `${event.clientX}px`)
      element.style.setProperty('--spotlight-y', `${event.clientY}px`)
    }

    globalThis.addEventListener('mousemove', handleMove)
    return () => globalThis.removeEventListener('mousemove', handleMove)
  }, [enabled])

  return ref
}
