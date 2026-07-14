export type PopoverAnchorEl = HTMLElement | (() => HTMLElement | null) | null

/** Resolves the `anchorEl` prop, which may be an element or a function returning one. */
export function resolveAnchorEl(anchorEl: PopoverAnchorEl): HTMLElement | null {
  return (typeof anchorEl === 'function' ? anchorEl() : anchorEl) ?? null
}
