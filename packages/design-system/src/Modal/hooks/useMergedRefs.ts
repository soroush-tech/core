import { useMemo, type Ref, type RefCallback } from 'react'

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ;(ref as { current: T | null }).current = value
  }
}

/**
 * Merges two refs into a single stable ref callback so one DOM node can be
 * tracked by both an internal ref and a forwarded `ref`. Returns `null` when
 * both refs are absent, so React skips attaching a callback ref entirely.
 */
export function useMergedRefs<T>(
  refA: Ref<T> | undefined,
  refB: Ref<T> | undefined
): RefCallback<T> | null {
  return useMemo(() => {
    if (refA == null && refB == null) {
      return null
    }
    return (value: T | null) => {
      assignRef(refA, value)
      assignRef(refB, value)
    }
  }, [refA, refB])
}
