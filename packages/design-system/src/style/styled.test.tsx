import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '../theme'
import { createTheme, baseTheme, type ComponentConfig } from '../theme/themes'
import { styled } from './styled'

// A consumer-style component registered under a custom theme.components key —
// exercises the wrapper directly, independent of any design-system component.
declare module '@emotion/react' {
  interface ThemeComponents {
    TestBox?: ComponentConfig<{ tone?: string }>
  }
}

const TestBox = styled('div', { name: 'TestBox' })<{ tone?: string }>({ padding: '1px' })

const renderWith = (
  components: Parameters<typeof createTheme>[1]['components'],
  ui: React.ReactNode
) => render(<ThemeProvider theme={createTheme(baseTheme, { components })}>{ui}</ThemeProvider>)

describe('styled (theme customization wrapper)', () => {
  it('falls through to plain Emotion when no name is given', () => {
    const Plain = styled('span')({ padding: '2px' })
    renderWith(
      { TestBox: { styleOverrides: { root: { padding: '9px' } } } },
      <Plain data-testid="plain" />
    )
    expect(screen.getByTestId('plain')).toHaveStyle({ padding: '2px' })
  })

  it('renders untouched when the theme has no components config', () => {
    render(
      <ThemeProvider>
        <TestBox data-testid="box" />
      </ThemeProvider>
    )
    expect(screen.getByTestId('box')).toHaveStyle({ padding: '1px' })
  })

  it('renders untouched when the config lacks styleOverrides and variants', () => {
    renderWith({ TestBox: { defaultProps: {} } }, <TestBox data-testid="box" />)
    expect(screen.getByTestId('box')).toHaveStyle({ padding: '1px' })
  })

  it('applies object styleOverrides for the root slot', () => {
    renderWith(
      { TestBox: { styleOverrides: { root: { padding: '9px' } } } },
      <TestBox data-testid="box" />
    )
    expect(screen.getByTestId('box')).toHaveStyle({ padding: '9px' })
  })

  it('supports a custom overridesResolver instead of the slot lookup', () => {
    const Resolved = styled('div', {
      name: 'TestBox',
      overridesResolver: (props, styleOverrides) => [
        styleOverrides.root,
        (props as { tone?: string }).tone === 'loud' && styleOverrides.loud,
      ],
    })<{ tone?: string }>({ padding: '1px' })

    renderWith(
      {
        TestBox: {
          styleOverrides: {
            root: { padding: '9px' },
            loud: { textTransform: 'uppercase' },
          } as ComponentConfig<{ tone?: string }, 'root' | 'loud'>['styleOverrides'],
        },
      },
      <Resolved tone="loud" data-testid="box" />
    )
    expect(screen.getByTestId('box')).toHaveStyle({
      padding: '9px',
      textTransform: 'uppercase',
    })
  })

  it('applies variants only on the root slot', () => {
    const Label = styled('span', { name: 'TestBox', slot: 'label' })({ padding: '1px' })
    renderWith(
      {
        TestBox: {
          variants: [{ props: { tone: 'loud' }, style: { letterSpacing: '1em' } }],
        },
      },
      <>
        <TestBox tone="loud" data-testid="root" />
        <Label data-testid="label" />
      </>
    )
    expect(screen.getByTestId('root')).toHaveStyle({ letterSpacing: '1em' })
    expect(screen.getByTestId('label')).not.toHaveStyle({ letterSpacing: '1em' })
  })

  it('keeps Emotion tag shortcuts working', () => {
    const Plain = styled.div({ padding: '3px' })
    render(<Plain data-testid="plain" />)
    expect(screen.getByTestId('plain')).toHaveStyle({ padding: '3px' })
  })
})
