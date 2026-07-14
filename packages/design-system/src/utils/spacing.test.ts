import { describe, it, expect } from 'vitest'
import { spacing } from './spacing'

describe('spacing', () => {
  it('should return correct spacing in px', () => {
    expect(spacing(0.5)).toBe('4px')
    expect(spacing(1)).toBe('8px')
    expect(spacing(1.5)).toBe('12px')
    expect(spacing(2)).toBe('16px')
    expect(spacing(3)).toBe('24px')
    expect(spacing(4)).toBe('32px')
    expect(spacing(5)).toBe('40px')
    expect(spacing(6)).toBe('48px')
    expect(spacing(7)).toBe('56px')
    expect(spacing(8)).toBe('64px')
  })
})
