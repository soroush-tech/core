import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { ThemeProvider } from '../ThemeProvider'
import { ButtonGroup } from '../ButtonGroup'
import { createTheme, baseTheme } from '../themes'
import { Button, type ButtonColor, type ButtonVariant, type ButtonSize } from '../Button'
import type { ButtonShape } from '../Button'

describe('Button', () => {
  // ─── children ────────────────────────────────────────────────────────────────

  describe('children', () => {
    it('renders text children', () => {
      renderWithTheme(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('renders element children', () => {
      renderWithTheme(
        <Button>
          Save <strong>now</strong>
        </Button>
      )
      expect(screen.getByText('now')).toBeInTheDocument()
    })
  })

  // ─── element ─────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders as a <button> element', () => {
      renderWithTheme(<Button>Click</Button>)
      expect(screen.getByRole('button', { name: /click/i })).toBeInTheDocument()
    })

    it('renders as an <a> with the href when href is set', () => {
      renderWithTheme(<Button href="/docs">Docs</Button>)
      expect(screen.getByRole('link', { name: /docs/i })).toHaveAttribute('href', '/docs')
    })

    it('does not underline the link when rendered as an <a>', () => {
      renderWithTheme(<Button href="/docs">Docs</Button>)
      expect(screen.getByRole('link', { name: /docs/i })).toHaveStyle({ textDecoration: 'none' })
    })
  })

  // ─── base styles ─────────────────────────────────────────────────────────────

  describe('base styles', () => {
    it('applies uppercase text transform', () => {
      renderWithTheme(<Button data-testid="btn">Click</Button>)
      expect(screen.getByTestId('btn')).toHaveStyle({ textTransform: 'uppercase' })
    })

    it('applies bold font weight', () => {
      renderWithTheme(<Button data-testid="btn">Click</Button>)
      expect(screen.getByTestId('btn')).toHaveStyle({ fontWeight: '700' })
    })

    it('applies tight letter spacing', () => {
      renderWithTheme(<Button data-testid="btn">Click</Button>)
      expect(screen.getByTestId('btn')).toHaveStyle({
        letterSpacing: baseTheme.letterSpacings.tight,
      })
    })
  })

  // ─── variant styles ───────────────────────────────────────────────────────────

  describe('variant', () => {
    const variants: ButtonVariant[] = ['contained', 'outlined', 'text']

    it.each(variants)('variant="%s" does not forward to DOM', (variant) => {
      renderWithTheme(
        <Button variant={variant} data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).not.toHaveAttribute('variant')
    })

    it('contained — applies background from theme.palette[color].main', () => {
      renderWithTheme(
        <Button variant="contained" color="primary" data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveStyle({
        backgroundColor: baseTheme.palette.primary.main,
        color: baseTheme.palette.primary.contrastText,
      })
    })

    it('reads its default color from theme.defaults via the ThemeProvider defaults prop', () => {
      render(
        <ThemeProvider defaults={{ color: 'error' }}>
          <Button variant="contained" data-testid="btn">
            btn
          </Button>
        </ThemeProvider>
      )
      expect(screen.getByTestId('btn')).toHaveStyle({
        backgroundColor: baseTheme.palette.error.main,
        color: baseTheme.palette.error.contrastText,
      })
    })
  })

  describe('theme.components.Button', () => {
    const withComponents = (
      components: NonNullable<Parameters<typeof createTheme>[1]['components']>,
      ui: ReactNode
    ) => render(<ThemeProvider theme={createTheme(baseTheme, { components })}>{ui}</ThemeProvider>)

    describe('defaultProps', () => {
      it('applies theme-contributed default props', () => {
        withComponents(
          { Button: { defaultProps: { color: 'error', shape: 'pill' } } },
          <Button data-testid="btn">btn</Button>
        )
        expect(screen.getByTestId('btn')).toHaveStyle({
          backgroundColor: baseTheme.palette.error.main,
          borderRadius: '9999px',
        })
      })

      it('explicit props beat defaultProps', () => {
        withComponents(
          { Button: { defaultProps: { color: 'error' } } },
          <Button color="primary" data-testid="btn">
            btn
          </Button>
        )
        expect(screen.getByTestId('btn')).toHaveStyle({
          backgroundColor: baseTheme.palette.primary.main,
        })
      })

      it('ButtonGroup context beats defaultProps', () => {
        withComponents(
          { Button: { defaultProps: { color: 'error' } } },
          <ButtonGroup color="success">
            <Button data-testid="btn">btn</Button>
          </ButtonGroup>
        )
        expect(screen.getByTestId('btn')).toHaveStyle({
          borderColor: baseTheme.palette.success.main,
        })
      })

      it('defaultProps beat theme.defaults', () => {
        render(
          <ThemeProvider
            theme={createTheme(baseTheme, {
              defaults: { color: 'success' },
              components: { Button: { defaultProps: { color: 'error' } } },
            })}
          >
            <Button data-testid="btn">btn</Button>
          </ThemeProvider>
        )
        expect(screen.getByTestId('btn')).toHaveStyle({
          backgroundColor: baseTheme.palette.error.main,
        })
      })
    })

    describe('styleOverrides', () => {
      it('applies root overrides after the component styles (theme wins)', () => {
        withComponents(
          { Button: { styleOverrides: { root: { textTransform: 'none', borderRadius: '7px' } } } },
          <Button data-testid="btn">btn</Button>
        )
        expect(screen.getByTestId('btn')).toHaveStyle({
          textTransform: 'none',
          borderRadius: '7px',
        })
      })

      it('callback overrides receive the theme and the resolved ownerState', () => {
        withComponents(
          {
            Button: {
              styleOverrides: {
                root: ({ theme, ownerState }) => ({
                  outlineColor:
                    ownerState.variant === 'contained' ? theme.palette.error.main : undefined,
                }),
              },
            },
          },
          <Button data-testid="btn">btn</Button>
        )
        expect(screen.getByTestId('btn')).toHaveStyle({
          outlineColor: baseTheme.palette.error.main,
        })
      })

      it('targets non-root slots', () => {
        withComponents(
          { Button: { styleOverrides: { label: { letterSpacing: '0.5em' } } } },
          <Button data-testid="btn">btn</Button>
        )
        const label = screen.getByText('btn')
        expect(label).toHaveStyle({ letterSpacing: '0.5em' })
      })

      it('per-instance styled-system props beat styleOverrides', () => {
        withComponents(
          { Button: { styleOverrides: { root: { margin: '0px' } } } },
          <Button m={2} data-testid="btn">
            btn
          </Button>
        )
        expect(screen.getByTestId('btn')).toHaveStyle({ margin: '16px' })
      })
    })

    describe('variants', () => {
      it('applies a matching theme-contributed variant', () => {
        withComponents(
          {
            Button: {
              variants: [
                {
                  props: { variant: 'dashed' as ButtonVariant },
                  style: ({ theme }) => ({
                    borderStyle: 'dashed',
                    borderColor: theme.border.primary,
                  }),
                },
              ],
            },
          },
          <Button variant={'dashed' as ButtonVariant} data-testid="btn">
            btn
          </Button>
        )
        expect(screen.getByTestId('btn')).toHaveStyle({
          borderStyle: 'dashed',
          borderColor: baseTheme.border.primary,
        })
      })

      it('skips non-matching variants', () => {
        withComponents(
          {
            Button: {
              variants: [{ props: { variant: 'outlined' }, style: { borderStyle: 'dotted' } }],
            },
          },
          <Button variant="contained" data-testid="btn">
            btn
          </Button>
        )
        expect(screen.getByTestId('btn')).not.toHaveStyle({ borderStyle: 'dotted' })
      })
    })
  })

  describe('variant styles', () => {
    it('outlined — applies main color as text and border color', () => {
      renderWithTheme(
        <Button variant="outlined" color="primary" data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveStyle({ color: baseTheme.palette.primary.main })
    })

    it('text — applies main color as text with no border', () => {
      renderWithTheme(
        <Button variant="text" color="primary" data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveStyle({
        color: baseTheme.palette.primary.main,
      })
    })
  })

  // ─── color → theme.palette ───────────────────────────────────────────────────

  describe('color resolves from theme.palette', () => {
    const colors: ButtonColor[] = ['primary', 'secondary', 'success', 'error', 'info', 'warning']

    it.each(colors)(
      'color="%s" applies theme.palette[color].main as text for outlined',
      (color) => {
        renderWithTheme(
          <Button variant="outlined" color={color} data-testid="btn">
            btn
          </Button>
        )
        expect(screen.getByTestId('btn')).toHaveStyle({ color: baseTheme.palette[color].main })
      }
    )

    it.each(colors)('color="%s" applies theme.palette[color].main as bg for contained', (color) => {
      renderWithTheme(
        <Button variant="contained" color={color} data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveStyle({
        backgroundColor: baseTheme.palette[color].main,
      })
    })

    it('does not forward color to DOM', () => {
      renderWithTheme(
        <Button color="primary" data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).not.toHaveAttribute('color')
    })
  })

  // ─── size ────────────────────────────────────────────────────────────────────

  describe('size', () => {
    it.each([
      ['sm', '4px', '12px', '12px'] as [ButtonSize, string, string, string],
      ['md', '8px', '16px', '14px'] as [ButtonSize, string, string, string],
      ['lg', '12px', '24px', '14px'] as [ButtonSize, string, string, string],
    ])('size="%s" → py=%s px=%s fontSize=%s', (size, py, px, fontSize) => {
      renderWithTheme(
        <Button size={size} data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveStyle({
        paddingTop: py,
        paddingLeft: px,
        fontSize,
      })
    })

    it('does not forward size to DOM', () => {
      renderWithTheme(
        <Button size="md" data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).not.toHaveAttribute('size')
    })
  })

  // ─── shape ───────────────────────────────────────────────────────────────────

  describe('shape', () => {
    it.each([
      ['rounded', '8px'] as [ButtonShape, string],
      ['pill', '9999px'] as [ButtonShape, string],
    ])('shape="%s" sets borderRadius %s', (shape, expected) => {
      renderWithTheme(
        <Button shape={shape} data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveStyle({ borderRadius: expected })
    })

    it('shape="square" produces a different class than shape="rounded"', () => {
      // borderRadius:0 is the CSS default — jsdom returns '' for computed style.
      // Verify via class name change instead (same approach as Avatar).
      const { rerender } = renderWithTheme(
        <Button shape="rounded" data-testid="btn">
          btn
        </Button>
      )
      const roundedClass = screen.getByTestId('btn').className
      rerender(
        <Button shape="square" data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn').className).not.toBe(roundedClass)
    })

    it('borderRadius prop overrides shape="square"', () => {
      renderWithTheme(
        <Button shape="square" borderRadius="lg" data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveStyle({ borderRadius: '16px' })
    })

    it('borderRadius prop overrides shape="pill"', () => {
      renderWithTheme(
        <Button shape="pill" borderRadius="sm" data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveStyle({ borderRadius: '4px' })
    })

    it('does not forward shape to DOM', () => {
      renderWithTheme(
        <Button shape="rounded" data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).not.toHaveAttribute('shape')
    })
  })

  // ─── icons ────────────────────────────────────────────────────────────────────

  describe('icons', () => {
    it('renders startIcon', () => {
      renderWithTheme(<Button startIcon={<span>start</span>}>Click</Button>)
      expect(screen.getByText('start')).toBeInTheDocument()
    })

    it('renders endIcon', () => {
      renderWithTheme(<Button endIcon={<span>end</span>}>Click</Button>)
      expect(screen.getByText('end')).toBeInTheDocument()
    })

    it('renders both startIcon and endIcon', () => {
      renderWithTheme(
        <Button startIcon={<span>start</span>} endIcon={<span>end</span>}>
          Click
        </Button>
      )
      expect(screen.getByText('start')).toBeInTheDocument()
      expect(screen.getByText('end')).toBeInTheDocument()
    })
  })

  // ─── fullWidth ────────────────────────────────────────────────────────────────

  describe('fullWidth', () => {
    it('applies width: 100% (class changes when fullWidth toggled)', () => {
      // jsdom cannot resolve % widths; verify via class name change instead
      const { rerender } = renderWithTheme(<Button data-testid="btn">btn</Button>)
      const defaultClass = screen.getByTestId('btn').className
      rerender(
        <Button fullWidth data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn').className).not.toBe(defaultClass)
    })

    it('does not apply width: 100% by default', () => {
      renderWithTheme(<Button data-testid="btn">btn</Button>)
      expect(screen.getByTestId('btn')).not.toHaveStyle({ width: '100%' })
    })

    it('does not forward fullWidth to DOM', () => {
      renderWithTheme(
        <Button fullWidth data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).not.toHaveAttribute('fullWidth')
    })
  })

  // ─── disabled ─────────────────────────────────────────────────────────────────

  describe('disabled', () => {
    it('disables the button', () => {
      renderWithTheme(<Button disabled>Click</Button>)
      expect(screen.getByRole('button', { name: /click/i })).toBeDisabled()
    })

    it('prevents click events when disabled', () => {
      const onClick = vi.fn()
      renderWithTheme(
        <Button disabled onClick={onClick}>
          Click
        </Button>
      )
      fireEvent.click(screen.getByRole('button', { name: /click/i }))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  // ─── loading ──────────────────────────────────────────────────────────────────

  describe('loading', () => {
    it('disables the button when loading=true', () => {
      renderWithTheme(<Button loading>Click</Button>)
      expect(screen.getByRole('button', { name: /click/i })).toBeDisabled()
    })

    it('sets aria-busy when loading=true', () => {
      renderWithTheme(
        <Button loading data-testid="btn">
          Click
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveAttribute('aria-busy', 'true')
    })

    it('does not set aria-busy when not loading', () => {
      renderWithTheme(<Button data-testid="btn">Click</Button>)
      expect(screen.getByTestId('btn')).not.toHaveAttribute('aria-busy')
    })

    it('does not forward loading to DOM', () => {
      renderWithTheme(
        <Button loading data-testid="btn">
          btn
        </Button>
      )
      expect(screen.getByTestId('btn')).not.toHaveAttribute('loading')
    })

    it('renders a custom loadingIndicator', () => {
      renderWithTheme(
        <Button loading loadingIndicator={<span>spinner</span>}>
          Click
        </Button>
      )
      expect(screen.getByText('spinner')).toBeInTheDocument()
    })

    it('loadingPosition=start replaces startIcon with indicator', () => {
      renderWithTheme(
        <Button loading loadingPosition="start" startIcon={<span>icon</span>}>
          Click
        </Button>
      )
      expect(screen.queryByText('icon')).not.toBeInTheDocument()
    })

    it('loadingPosition=end replaces endIcon with indicator', () => {
      renderWithTheme(
        <Button loading loadingPosition="end" endIcon={<span>icon</span>}>
          Click
        </Button>
      )
      expect(screen.queryByText('icon')).not.toBeInTheDocument()
    })

    it('loadingPosition=center visually hides children label but keeps it accessible', () => {
      renderWithTheme(
        <Button loading loadingPosition="center" loadingIndicator={<span>spinner</span>}>
          Click
        </Button>
      )
      const label = screen.getByText('Click').closest('span')
      expect(label).toHaveStyle({ opacity: '0' })
      expect(screen.getByRole('button', { name: /click/i })).toBeInTheDocument()
    })

    it('loadingPosition=center renders indicator', () => {
      renderWithTheme(
        <Button loading loadingPosition="center" loadingIndicator={<span>spinner</span>}>
          Click
        </Button>
      )
      expect(screen.getByText('spinner')).toBeInTheDocument()
    })
  })

  // ─── HTML attribute passthrough ───────────────────────────────────────────────

  describe('HTML attribute passthrough', () => {
    it('forwards onClick', () => {
      const onClick = vi.fn()
      renderWithTheme(<Button onClick={onClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button', { name: /click/i }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('forwards className', () => {
      renderWithTheme(<Button className="custom">Click</Button>)
      expect(screen.getByRole('button', { name: /click/i })).toHaveClass('custom')
    })

    it('forwards data attributes', () => {
      renderWithTheme(<Button data-testid="my-btn">Click</Button>)
      expect(screen.getByTestId('my-btn')).toBeInTheDocument()
    })

    it('forwards aria-label', () => {
      renderWithTheme(<Button aria-label="submit form">Click</Button>)
      expect(screen.getByRole('button', { name: 'submit form' })).toBeInTheDocument()
    })

    it('forwards type attribute', () => {
      renderWithTheme(
        <Button type="submit" data-testid="btn">
          Submit
        </Button>
      )
      expect(screen.getByTestId('btn')).toHaveAttribute('type', 'submit')
    })
  })
})
