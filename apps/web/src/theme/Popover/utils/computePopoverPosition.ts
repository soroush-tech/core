import {
  getOffsetLeft,
  getOffsetTop,
  type PopoverHorizontalOrigin,
  type PopoverVerticalOrigin,
} from './getOffset'
import { getTransformOriginValue } from './getTransformOriginValue'

export interface PopoverOrigin {
  vertical: PopoverVerticalOrigin
  horizontal: PopoverHorizontalOrigin
}

export type PopoverReference = 'anchorEl' | 'anchorPosition' | 'none'

export interface PopoverPosition {
  top: number
  left: number
}

export interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
}

export interface ComputePopoverPositionParams {
  anchorReference: PopoverReference
  /** Bounding rect of the resolved `anchorEl`, or `null` when unavailable. */
  anchorRect: AnchorRect | null
  /** Explicit client coordinates, used when `anchorReference === 'anchorPosition'`. */
  anchorPosition?: PopoverPosition
  /** The popover surface's own size. */
  paperRect: { width: number; height: number }
  anchorOrigin: PopoverOrigin
  transformOrigin: PopoverOrigin
  viewport: { width: number; height: number }
  /** Minimum gap from the viewport edge; `null` disables edge clamping and flipping. */
  marginThreshold: number | null
}

export interface PositioningStyle {
  top: number | null
  left: number | null
  transformOrigin: string
}

type Origin = PopoverVerticalOrigin | PopoverHorizontalOrigin

/** Mirrors a keyword origin to the opposite edge; numbers and `center` are unchanged. */
function flipVertical(origin: PopoverVerticalOrigin): PopoverVerticalOrigin {
  if (origin === 'top') return 'bottom'
  if (origin === 'bottom') return 'top'
  return origin
}

function flipHorizontal(origin: PopoverHorizontalOrigin): PopoverHorizontalOrigin {
  if (origin === 'left') return 'right'
  if (origin === 'right') return 'left'
  return origin
}

interface AxisResult {
  position: number
  transformOffset: number
}

/**
 * Resolves one axis: places the paper at the preferred origin, flips to the opposite
 * origin when the preferred side overflows and the flipped side fits, then clamps the
 * chosen position inside the viewport (nudging the transform origin to match).
 */
function resolveAxis(
  anchorStart: number,
  anchorSize: number,
  anchorOrigin: Origin,
  transformOrigin: Origin,
  paperSize: number,
  viewportSize: number,
  margin: number | null,
  offset: (size: number, origin: Origin) => number,
  flip: (origin: Origin) => Origin
): AxisResult {
  const preferredTransform = offset(paperSize, transformOrigin)
  const preferredPosition = anchorStart + offset(anchorSize, anchorOrigin) - preferredTransform

  let position = preferredPosition
  let transformOffset = preferredTransform

  if (margin != null) {
    const fits = (candidate: number) =>
      candidate >= margin && candidate + paperSize <= viewportSize - margin

    // Flip to the opposite side when the preferred one overflows but the flip fits.
    if (!fits(preferredPosition)) {
      const flippedTransform = offset(paperSize, flip(transformOrigin))
      const flippedPosition =
        anchorStart + offset(anchorSize, flip(anchorOrigin)) - flippedTransform
      if (fits(flippedPosition)) {
        position = flippedPosition
        transformOffset = flippedTransform
      }
    }

    // Clamp whatever side we landed on back inside the viewport.
    if (position < margin) {
      const diff = position - margin
      position -= diff
      transformOffset += diff
    } else if (position + paperSize > viewportSize - margin) {
      const diff = position + paperSize - (viewportSize - margin)
      position -= diff
      transformOffset += diff
    }
  }

  return { position, transformOffset }
}

/**
 * Places the paper so its `transformOrigin` meets the anchor's `anchorOrigin`, flipping
 * to the opposite side at a viewport edge and clamping as a fallback. Returns `null`
 * coordinates for `anchorReference === 'none'`.
 */
export function computePopoverPosition(params: ComputePopoverPositionParams): PositioningStyle {
  const {
    anchorReference,
    anchorRect,
    anchorPosition,
    paperRect,
    anchorOrigin,
    transformOrigin,
    viewport,
    marginThreshold,
  } = params

  if (anchorReference === 'none') {
    return {
      top: null,
      left: null,
      transformOrigin: getTransformOriginValue({
        vertical: getOffsetTop(paperRect, transformOrigin.vertical),
        horizontal: getOffsetLeft(paperRect, transformOrigin.horizontal),
      }),
    }
  }

  // A point anchor (anchorPosition) has zero size, so anchorOrigin resolves to the point itself.
  const rect: AnchorRect =
    anchorReference === 'anchorPosition'
      ? { top: anchorPosition?.top ?? 0, left: anchorPosition?.left ?? 0, width: 0, height: 0 }
      : (anchorRect ?? { top: 0, left: 0, width: 0, height: 0 })

  const vertical = resolveAxis(
    rect.top,
    rect.height,
    anchorOrigin.vertical,
    transformOrigin.vertical,
    paperRect.height,
    viewport.height,
    marginThreshold,
    (size, origin) => getOffsetTop({ height: size }, origin as PopoverVerticalOrigin),
    (origin) => flipVertical(origin as PopoverVerticalOrigin)
  )

  const horizontal = resolveAxis(
    rect.left,
    rect.width,
    anchorOrigin.horizontal,
    transformOrigin.horizontal,
    paperRect.width,
    viewport.width,
    marginThreshold,
    (size, origin) => getOffsetLeft({ width: size }, origin as PopoverHorizontalOrigin),
    (origin) => flipHorizontal(origin as PopoverHorizontalOrigin)
  )

  // Floor (not round) so the surface abuts the anchor: rounding a fractional anchor edge
  // up would leave a hairline gap below the trigger (visible on borderless surfaces).
  return {
    top: Math.floor(vertical.position),
    left: Math.floor(horizontal.position),
    transformOrigin: getTransformOriginValue({
      vertical: vertical.transformOffset,
      horizontal: horizontal.transformOffset,
    }),
  }
}
