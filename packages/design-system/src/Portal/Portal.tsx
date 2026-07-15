import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface PortalProps {
  /** Content to render into the container. */
  children: ReactNode
  /** Target node, or a function returning one. Defaults to `document.body`. */
  container?: HTMLElement | (() => HTMLElement | null) | null
}

function resolveContainer(container: PortalProps['container']): HTMLElement | null {
  const resolved = typeof container === 'function' ? container() : container
  return resolved ?? null
}

/**
 * Renders its children into a DOM node outside the parent hierarchy (the document
 * body by default). Resolves the container synchronously during render, so the
 * portaled content mounts in the same commit — consumers like Modal can rely on
 * their root ref being attached before their effects run. Renders nothing during
 * server rendering.
 */
export function Portal({ children, container }: Readonly<PortalProps>) {
  if (typeof document === 'undefined') {
    return null
  }
  return createPortal(children, resolveContainer(container) ?? document.body)
}
