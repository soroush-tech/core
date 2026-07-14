import { describe, it, expect } from 'vitest'
import { clamp } from './clamp'

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('returns min when value is below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('returns max when value is above max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10)
  })

  it('works with negative ranges', () => {
    expect(clamp(-3, -10, -1)).toBe(-3)
    expect(clamp(0, -10, -1)).toBe(-1)
    expect(clamp(-20, -10, -1)).toBe(-10)
  })

  it('works with floating point values', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
    expect(clamp(1.5, 0, 1)).toBe(1)
    expect(clamp(-0.5, 0, 1)).toBe(0)
  })

  it('returns min when min equals max', () => {
    expect(clamp(5, 3, 3)).toBe(3)
  })
})
