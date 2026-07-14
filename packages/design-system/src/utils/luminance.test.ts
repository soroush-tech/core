import { describe, it, expect } from 'vitest'
import { luminance } from './luminance'

describe('luminance', () => {
  it('returns 0 for pure black', () => {
    expect(luminance('#000000')).toBe(0)
  })

  it('returns 1 for pure white', () => {
    expect(luminance('#ffffff')).toBe(1)
  })

  it('returns > 0.5 for a light colour', () => {
    expect(luminance('#00FF41')).toBeGreaterThan(0.5)
  })

  it('returns < 0.5 for a dark colour', () => {
    expect(luminance('#1a1a2e')).toBeLessThan(0.5)
  })

  it('weights green channel highest', () => {
    expect(luminance('#00ff00')).toBeGreaterThan(luminance('#ff0000'))
    expect(luminance('#00ff00')).toBeGreaterThan(luminance('#0000ff'))
  })
})
