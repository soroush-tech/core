export type PopoverVerticalOrigin = 'top' | 'center' | 'bottom' | number
export type PopoverHorizontalOrigin = 'left' | 'center' | 'right' | number

/** Vertical offset within a rect for an anchor/transform origin keyword or explicit px. */
export function getOffsetTop(rect: { height: number }, vertical: PopoverVerticalOrigin): number {
  if (typeof vertical === 'number') {
    return vertical
  }
  if (vertical === 'center') {
    return rect.height / 2
  }
  if (vertical === 'bottom') {
    return rect.height
  }
  return 0
}

/** Horizontal offset within a rect for an anchor/transform origin keyword or explicit px. */
export function getOffsetLeft(
  rect: { width: number },
  horizontal: PopoverHorizontalOrigin
): number {
  if (typeof horizontal === 'number') {
    return horizontal
  }
  if (horizontal === 'center') {
    return rect.width / 2
  }
  if (horizontal === 'right') {
    return rect.width
  }
  return 0
}
