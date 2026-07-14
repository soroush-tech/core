import { useCallback, useEffect, useRef } from 'react'

/**
 * Returns a stable function identity that always calls the latest `fn`. Lets
 * effects depend on the callback without re-running when the handler changes.
 *
 * Syncs the ref in `useEffect` (not `useLayoutEffect`) so it stays SSR-safe —
 * the timing difference is irrelevant for the user-triggered handlers it wraps.
 */
export function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  const ref = useRef(fn)
  useEffect(() => {
    ref.current = fn
  })
  return useCallback((...args: Args) => ref.current(...args), [])
}
