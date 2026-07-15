import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { GlobalStyles } from './GlobalStyles'

describe('GlobalStyles', () => {
  it('injects the global stylesheet with the brand fonts', () => {
    renderWithTheme(<GlobalStyles />)
    const globalCss = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent)
      .join('\n')
    expect(globalCss).toContain('Space Grotesk')
    expect(globalCss).toContain('box-sizing')
  })
})
