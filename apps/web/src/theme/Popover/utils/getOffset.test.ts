import { describe, it, expect } from 'vitest'
import { getOffsetTop, getOffsetLeft } from './getOffset'

describe('getOffsetTop', () => {
  it('returns an explicit numeric offset as-is', () => {
    expect(getOffsetTop({ height: 100 }, 24)).toBe(24)
  })
  it('resolves keyword origins against the rect height', () => {
    expect(getOffsetTop({ height: 100 }, 'top')).toBe(0)
    expect(getOffsetTop({ height: 100 }, 'center')).toBe(50)
    expect(getOffsetTop({ height: 100 }, 'bottom')).toBe(100)
  })
})

describe('getOffsetLeft', () => {
  it('returns an explicit numeric offset as-is', () => {
    expect(getOffsetLeft({ width: 80 }, 12)).toBe(12)
  })
  it('resolves keyword origins against the rect width', () => {
    expect(getOffsetLeft({ width: 80 }, 'left')).toBe(0)
    expect(getOffsetLeft({ width: 80 }, 'center')).toBe(40)
    expect(getOffsetLeft({ width: 80 }, 'right')).toBe(80)
  })
})
