import { ownerDocument } from './ownerDocument'

/**
 * Returns the `Window` that owns the given node, falling back to the global
 * `window`. Used to read viewport metrics for scroll-lock calculations.
 */
export function ownerWindow(node: Node | null | undefined): Window {
  const doc = ownerDocument(node)
  return doc.defaultView ?? window
}
