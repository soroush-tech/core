import { render } from '@testing-library/react'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from './editorTheme'
import { GlobalStyles } from './GlobalStyles'

describe('GlobalStyles', () => {
  it('injects the app font-family and the package reset', () => {
    render(
      <ThemeProvider theme={editorTheme}>
        <GlobalStyles />
      </ThemeProvider>
    )
    const styles = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent)
      .join('\n')
    expect(styles).toContain('font-family')
    expect(styles).toContain('box-sizing')
    expect(styles).toContain('min-height')
  })
})
