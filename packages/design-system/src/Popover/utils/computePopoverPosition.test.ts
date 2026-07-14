import { describe, it, expect } from 'vitest'
import { computePopoverPosition, type ComputePopoverPositionParams } from './computePopoverPosition'

const base: ComputePopoverPositionParams = {
  anchorReference: 'anchorEl',
  anchorRect: { top: 100, left: 50, width: 200, height: 40 },
  paperRect: { width: 100, height: 50 },
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  viewport: { width: 1000, height: 800 },
  marginThreshold: 16,
}

describe('computePopoverPosition', () => {
  it('returns null coordinates for anchorReference "none"', () => {
    expect(computePopoverPosition({ ...base, anchorReference: 'none', anchorRect: null })).toEqual({
      top: null,
      left: null,
      transformOrigin: '0px 0px',
    })
  })

  it('floors fractional coordinates so the surface abuts the anchor without a gap', () => {
    const result = computePopoverPosition({
      ...base,
      anchorRect: { top: 100.5, left: 50.7, width: 200, height: 40.4 },
    })
    expect(result).toMatchObject({ top: 140, left: 50 })
  })

  it('anchors below-left of the anchor element (no clamping needed)', () => {
    expect(computePopoverPosition(base)).toEqual({
      top: 140,
      left: 50,
      transformOrigin: '0px 0px',
    })
  })

  it('uses anchorPosition when the reference is "anchorPosition"', () => {
    expect(
      computePopoverPosition({
        ...base,
        anchorReference: 'anchorPosition',
        anchorRect: null,
        anchorPosition: { top: 200, left: 300 },
      })
    ).toEqual({ top: 200, left: 300, transformOrigin: '0px 0px' })
  })

  it('falls back to the origin when anchorPosition/anchorRect are missing', () => {
    expect(
      computePopoverPosition({ ...base, anchorReference: 'anchorPosition', anchorRect: null })
    ).toMatchObject({ top: 16, left: 16 })
  })

  it('shifts down and moves the transform origin when clamped off the top', () => {
    const result = computePopoverPosition({
      ...base,
      anchorRect: { top: -100, left: 50, width: 10, height: 10 },
      anchorOrigin: { vertical: 'top', horizontal: 'left' },
    })
    expect(result).toEqual({ top: 16, left: 50, transformOrigin: '0px -116px' })
  })

  it('flips above the anchor when there is no room below', () => {
    // anchor bottom (790) + paper (50) overflows the 784 threshold, so it flips above:
    // anchor top (780) − paper (50) = 730.
    const result = computePopoverPosition({
      ...base,
      anchorRect: { top: 780, left: 50, width: 10, height: 10 },
    })
    expect(result.top).toBe(730)
  })

  it('shifts right when clamped off the left', () => {
    const result = computePopoverPosition({
      ...base,
      anchorRect: { top: 100, left: -50, width: 10, height: 10 },
    })
    expect(result.left).toBe(16)
  })

  it('flips to the left of the anchor when there is no room on the right', () => {
    // anchor left (900) + paper (100) overflows the 984 threshold, so it flips to align
    // the paper's right edge to the anchor's right edge: (900 + 10) − 100 = 810.
    const result = computePopoverPosition({
      ...base,
      anchorRect: { top: 100, left: 900, width: 10, height: 10 },
    })
    expect(result.left).toBe(810)
  })

  it('treats a missing anchor rect as the viewport origin', () => {
    const result = computePopoverPosition({
      ...base,
      anchorRect: null,
      anchorOrigin: { vertical: 'top', horizontal: 'left' },
      marginThreshold: null,
    })
    expect(result).toMatchObject({ top: 0, left: 0 })
  })

  it('attempts to flip a right-aligned origin toward the left near the left edge', () => {
    const result = computePopoverPosition({
      ...base,
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      anchorRect: { top: 100, left: 5, width: 10, height: 10 },
    })
    // Right-aligned attach point (15) sits under the 16px margin, so it clamps to 16.
    expect(result.left).toBe(16)
  })

  it('clamps to the bottom edge when a too-tall paper fits on neither side', () => {
    // Paper (900) is taller than the viewport, so flipping cannot help — it clamps its
    // bottom to the threshold: 780 + 10 (anchor bottom) then shifted up by the overflow.
    const result = computePopoverPosition({
      ...base,
      paperRect: { width: 100, height: 900 },
      anchorRect: { top: 780, left: 50, width: 10, height: 10 },
    })
    expect(result.top).toBe(-116)
  })

  it('flips center origins too (center stays center on the flipped axis)', () => {
    const result = computePopoverPosition({
      ...base,
      anchorOrigin: { vertical: 'center', horizontal: 'center' },
      transformOrigin: { vertical: 'top', horizontal: 'left' },
      anchorRect: { top: 770, left: 970, width: 10, height: 10 },
    })
    // Both axes overflow, so both flip: vertical → 725, horizontal → 875.
    expect(result).toMatchObject({ top: 725, left: 875 })
  })

  it('does not clamp when marginThreshold is null', () => {
    const result = computePopoverPosition({
      ...base,
      marginThreshold: null,
      anchorRect: { top: -100, left: -100, width: 10, height: 10 },
      anchorOrigin: { vertical: 'top', horizontal: 'left' },
    })
    expect(result).toMatchObject({ top: -100, left: -100 })
  })
})
