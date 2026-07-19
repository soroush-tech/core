import { describe, it, expect } from 'vitest'
import { baseTheme, createTheme } from '../theme/themes'
import { globalStyles } from './globalStyles'

describe('globalStyles', () => {
  it('includes the box-sizing and table resets', () => {
    const { styles } = globalStyles(baseTheme)
    expect(styles).toContain('box-sizing: border-box')
    expect(styles).toContain('border-collapse: collapse')
  })

  it('resolves body colors and color-scheme from the theme', () => {
    const { styles } = globalStyles(baseTheme)
    expect(styles).toContain(baseTheme.colorScheme)
    expect(styles).toContain(baseTheme.background.primary)
    expect(styles).toContain(baseTheme.text.initial)
  })

  it('reflects a theme override', () => {
    const theme = createTheme(baseTheme, { background: { primary: '#123456' } })
    expect(globalStyles(theme).styles).toContain('#123456')
  })
})
