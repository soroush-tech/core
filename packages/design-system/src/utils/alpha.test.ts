import { describe, it, expect } from 'vitest'
import { alpha } from './alpha'

describe('alpha', () => {
  it('appends a two-digit uppercase alpha channel', () => {
    expect(alpha('#4ade80', 0.1)).toBe('#4ade801A')
    expect(alpha('#ffffff', 0.8)).toBe('#ffffffCC')
    expect(alpha('#000000', 0.05)).toBe('#0000000D')
  })

  it('pads single-digit channels to two digits', () => {
    expect(alpha('#123456', 0)).toBe('#12345600')
  })

  it('returns FF for full opacity', () => {
    expect(alpha('#123456', 1)).toBe('#123456FF')
  })

  it('clamps out-of-range opacity', () => {
    expect(alpha('#123456', -1)).toBe('#12345600')
    expect(alpha('#123456', 2)).toBe('#123456FF')
  })
})
