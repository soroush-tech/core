import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { CSSObject } from '@emotion/react'
import { ThemeProvider } from '../ThemeProvider'
import { dark } from '../themes'
import type { Theme } from '../themes'
import { StylesConsumer } from './StylesConsumer'
import { withStyles } from './withStyles'
import { withTheme } from './withTheme'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={dark}>{children}</ThemeProvider>
)

describe('StylesConsumer', () => {
  it('calls children with styles computed from theme', () => {
    const style = { getStyles: (theme: Theme) => ({ color: theme.text.primary }) }
    render(
      wrapper({
        children: (
          <StylesConsumer style={style}>
            {(styles) => <span data-testid="out">{(styles as { color: string }).color}</span>}
          </StylesConsumer>
        ),
      })
    )
    expect(screen.getByTestId('out').textContent).toBe(dark.text.primary)
  })
})

describe('withStyles', () => {
  it('passes computed styles when style has getStyles', () => {
    const style = { getStyles: (theme: Theme) => ({ color: theme.text.primary }) }
    function Base({ styles }: { styles: CSSObject }) {
      return <span data-testid="out">{(styles as { color: string }).color}</span>
    }
    const Enhanced = withStyles<object>(style)(Base)
    render(wrapper({ children: <Enhanced /> }))
    expect(screen.getByTestId('out').textContent).toBe(dark.text.primary)
  })

  it('passes the plain CSSObject when style has no getStyles', () => {
    const style: CSSObject = { color: 'lime' }
    function Base({ styles }: { styles: CSSObject }) {
      return <span data-testid="out">{(styles as { color: string }).color}</span>
    }
    const Enhanced = withStyles<object>(style)(Base)
    render(wrapper({ children: <Enhanced /> }))
    expect(screen.getByTestId('out').textContent).toBe('lime')
  })
})

describe('withTheme', () => {
  it('injects the current theme into the wrapped component', () => {
    function Base({ theme }: { theme: Theme }) {
      return <span data-testid="out">{theme.name}</span>
    }
    const Enhanced = withTheme(Base)
    render(wrapper({ children: <Enhanced /> }))
    expect(screen.getByTestId('out').textContent).toBe(dark.name)
  })
})
