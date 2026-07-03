import { describe, expect, it } from 'vitest'
import { themeGet } from './theme-get'

describe('themeGet', () => {
  it('reads a dotted path off the theme', () => {
    expect(themeGet('colors.primary')({ theme: { colors: { primary: '#f00' } } })).toBe('#f00')
  })

  it('resolves an array path as a nested lookup', () => {
    expect(themeGet(['colors', 'primary'])({ theme: { colors: { primary: '#f00' } } })).toBe('#f00')
  })

  it('returns null by default and a custom fallback when missing', () => {
    expect(themeGet('colors.primary')({ theme: {} })).toBeNull()
    expect(themeGet('space.9', '1rem')({ theme: {} })).toBe('1rem')
  })
})
