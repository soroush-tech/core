import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { ThemeProvider } from '../theme'
import { baseTheme, createTheme } from '../theme/themes'

// A second theme with a different surface value — proves tokens resolve per-theme.
const light = createTheme(baseTheme, { background: { paper: '#F3F3F3' } })
import { AppBar } from '../AppBar'

describe('AppBar', () => {
  // ─── element ────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders a header element', () => {
      renderWithTheme(<AppBar data-testid="bar" />)
      expect(screen.getByTestId('bar').tagName.toLowerCase()).toBe('header')
    })
  })

  // ─── children ───────────────────────────────────────────────────────────────

  describe('children', () => {
    it('renders children', () => {
      renderWithTheme(<AppBar>Navigation</AppBar>)
      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      renderWithTheme(
        <AppBar>
          <span>Logo</span>
          <span>Links</span>
        </AppBar>
      )
      expect(screen.getByText('Logo')).toBeInTheDocument()
      expect(screen.getByText('Links')).toBeInTheDocument()
    })
  })

  // ─── default styles ─────────────────────────────────────────────────────────

  describe('default styles', () => {
    it('spans full width', () => {
      renderWithTheme(<AppBar data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ width: '100%' })
    })

    it('applies elevation shadow from theme', () => {
      renderWithTheme(<AppBar data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ boxShadow: baseTheme.shadows[4] })
    })

    it('applies default padding from theme.sizes.md', () => {
      renderWithTheme(<AppBar data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({
        paddingLeft: baseTheme.space[2],
        paddingRight: baseTheme.space[2],
        paddingTop: baseTheme.space[1],
        paddingBottom: baseTheme.space[1],
      })
    })

    it('allows px prop to override default horizontal padding', () => {
      renderWithTheme(<AppBar px={1} data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({
        paddingLeft: baseTheme.space[1],
        paddingRight: baseTheme.space[1],
      })
    })

    it('allows py prop to override default vertical padding', () => {
      renderWithTheme(<AppBar py={2} data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({
        paddingTop: baseTheme.space[2],
        paddingBottom: baseTheme.space[2],
      })
    })

    it('has flex-direction column', () => {
      renderWithTheme(<AppBar data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ flexDirection: 'column' })
    })

    it('has flex-shrink 0', () => {
      renderWithTheme(<AppBar data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ flexShrink: 0 })
    })
  })

  // ─── size ───────────────────────────────────────────────────────────────────

  describe('size', () => {
    it('size="sm" applies theme.sizes.sm padding', () => {
      renderWithTheme(<AppBar size="sm" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({
        paddingLeft: baseTheme.space[1.5],
        paddingTop: baseTheme.space[0.5],
      })
    })

    it('size="md" applies theme.sizes.md padding', () => {
      renderWithTheme(<AppBar size="md" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({
        paddingLeft: baseTheme.space[2],
        paddingTop: baseTheme.space[1],
      })
    })

    it('size="lg" applies theme.sizes.lg padding', () => {
      renderWithTheme(<AppBar size="lg" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({
        paddingLeft: baseTheme.space[3],
        paddingTop: baseTheme.space[1.5],
      })
    })

    it('size="sm" applies theme.sizes.sm fontSize', () => {
      renderWithTheme(<AppBar size="sm" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ fontSize: baseTheme.fontSizes[0] })
    })

    it('size="md" applies theme.sizes.md fontSize', () => {
      renderWithTheme(<AppBar size="md" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ fontSize: baseTheme.fontSizes[1] })
    })

    it('size="lg" applies theme.sizes.lg fontSize', () => {
      renderWithTheme(<AppBar size="lg" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ fontSize: baseTheme.fontSizes[1] })
    })
  })

  // ─── color ──────────────────────────────────────────────────────────────────

  describe('color', () => {
    it('sets backgroundColor from theme.background in dark mode', () => {
      renderWithTheme(<AppBar color="paper" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ backgroundColor: baseTheme.background.paper })
    })

    it('sets backgroundColor from theme.background in light mode', () => {
      render(
        <ThemeProvider theme={light}>
          <AppBar color="paper" data-testid="bar" />
        </ThemeProvider>
      )
      expect(screen.getByTestId('bar')).toHaveStyle({ backgroundColor: light.background.paper })
    })

    it('dark and light resolve to different values for the same token', () => {
      expect(baseTheme.background.paper).not.toBe(light.background.paper)
    })

    it('applies all background tokens without error', () => {
      const colors = Object.keys(baseTheme.background) as (keyof typeof baseTheme.background)[]
      colors.forEach((color) => {
        const { unmount } = renderWithTheme(<AppBar color={color} data-testid="bar" />)
        expect(screen.getByTestId('bar')).toHaveStyle({
          backgroundColor: baseTheme.background[color],
        })
        unmount()
      })
    })

    it('does not apply backgroundColor when color is omitted', () => {
      renderWithTheme(<AppBar data-testid="bar" />)
      const style = getComputedStyle(screen.getByTestId('bar'))
      // transparent is excluded — rgba(0,0,0,0) is also the default computed value for unstyled elements
      const opaqueTokens = Object.values(baseTheme.background).filter(
        (v) => v !== baseTheme.background.transparent
      )
      expect(opaqueTokens).not.toContain(style.backgroundColor)
    })
  })

  // ─── elevation ──────────────────────────────────────────────────────────────

  describe('elevation', () => {
    it('elevation={0} applies theme.shadows[0]', () => {
      renderWithTheme(<AppBar elevation={0} data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ boxShadow: baseTheme.shadows[0] })
    })

    it('elevation={8} applies theme.shadows[8]', () => {
      renderWithTheme(<AppBar elevation={8} data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ boxShadow: baseTheme.shadows[8] })
    })

    it('elevation={4} matches the default shadow', () => {
      renderWithTheme(<AppBar elevation={4} data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ boxShadow: baseTheme.shadows[4] })
    })
  })

  // ─── position ───────────────────────────────────────────────────────────────

  describe('position', () => {
    it('applies fixed position', () => {
      renderWithTheme(<AppBar position="fixed" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ position: 'fixed' })
    })

    it('applies sticky position', () => {
      renderWithTheme(<AppBar position="sticky" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ position: 'sticky' })
    })

    it('applies absolute position', () => {
      renderWithTheme(<AppBar position="absolute" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ position: 'absolute' })
    })

    it('applies relative position', () => {
      renderWithTheme(<AppBar position="relative" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ position: 'relative' })
    })

    it('applies static position', () => {
      renderWithTheme(<AppBar position="static" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ position: 'static' })
    })
  })

  // ─── zOrder ───────────────────────────────────────────────────────────────────

  describe('zOrder', () => {
    it('defaults zIndex to theme.zOrder.appBar', () => {
      renderWithTheme(<AppBar data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ zIndex: baseTheme.zOrder.appBar })
    })

    it('allows an explicit zIndex prop to override the default', () => {
      renderWithTheme(<AppBar zIndex={5} data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ zIndex: 5 })
    })
  })

  // ─── flex props ─────────────────────────────────────────────────────────────

  describe('flex props', () => {
    it('flexDirection="row" overrides the column default', () => {
      renderWithTheme(<AppBar flexDirection="row" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ flexDirection: 'row' })
    })

    it('applies alignItems', () => {
      renderWithTheme(<AppBar alignItems="center" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ alignItems: 'center' })
    })

    it('applies justifyContent', () => {
      renderWithTheme(<AppBar justifyContent="space-between" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ justifyContent: 'space-between' })
    })

    it('applies gap from theme.space scale', () => {
      renderWithTheme(<AppBar gap={2} data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ gap: baseTheme.space[2] })
    })
  })

  // ─── blur ────────────────────────────────────────────────────────────────────

  describe('blur', () => {
    it('applies backdropFilter when blur is true', () => {
      renderWithTheme(<AppBar blur data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ backdropFilter: `blur(${baseTheme.blur})` })
    })

    it('does not apply backdropFilter when blur is omitted', () => {
      renderWithTheme(<AppBar data-testid="bar" />)
      expect(screen.getByTestId('bar')).not.toHaveStyle({
        backdropFilter: `blur(${baseTheme.blur})`,
      })
    })
  })

  // ─── borders ─────────────────────────────────────────────────────────────────

  describe('borders', () => {
    it('applies borderBottom', () => {
      renderWithTheme(<AppBar borderBottom="1px solid red" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveStyle({ borderBottom: '1px solid rgb(255, 0, 0)' })
    })
  })

  // ─── HTML passthrough ────────────────────────────────────────────────────────

  describe('HTML passthrough', () => {
    it('forwards className', () => {
      renderWithTheme(<AppBar className="custom" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveClass('custom')
    })

    it('forwards aria-label', () => {
      renderWithTheme(<AppBar aria-label="site navigation" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveAttribute('aria-label', 'site navigation')
    })

    it('forwards data-* attributes', () => {
      renderWithTheme(<AppBar data-custom="yes" data-testid="bar" />)
      expect(screen.getByTestId('bar')).toHaveAttribute('data-custom', 'yes')
    })
  })
})
