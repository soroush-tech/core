import { describe, it, expect } from 'vitest'
import { baseTheme } from '../themes'
import { createTheme } from './createTheme'
import { themeDefault } from './themeDefault'

describe('themeDefault', () => {
  it('returns the fallback when the theme carries no defaults', () => {
    expect(themeDefault(baseTheme, 'size', 'md')).toBe('md')
  })

  it('returns the fallback when the defaults map omits the key', () => {
    const theme = createTheme(baseTheme, { defaults: { color: 'error' } })
    expect(themeDefault(theme, 'size', 'md')).toBe('md')
  })

  it('returns the theme override when set', () => {
    const theme = createTheme(baseTheme, { defaults: { size: 'lg', switchVariant: 'inside' } })
    expect(themeDefault(theme, 'size', 'md')).toBe('lg')
    expect(themeDefault(theme, 'switchVariant', 'outside')).toBe('inside')
  })
})
