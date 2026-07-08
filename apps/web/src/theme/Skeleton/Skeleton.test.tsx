import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { dark } from 'src/theme/themes'
import { Skeleton } from '../Skeleton'

describe('Skeleton', () => {
  // ─── element ─────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders a span by default', () => {
      renderWithTheme(<Skeleton data-testid="sk" />)
      expect(screen.getByTestId('sk').tagName.toLowerCase()).toBe('span')
    })

    it('renders as a different element via the as prop', () => {
      renderWithTheme(<Skeleton as="div" data-testid="sk" />)
      expect(screen.getByTestId('sk').tagName.toLowerCase()).toBe('div')
    })

    it('applies the theme skeleton surface as background', () => {
      renderWithTheme(<Skeleton data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ backgroundColor: dark.background.default })
    })
  })

  // ─── variant shapes ────────────────────────────────────────────────────────────

  describe('variant', () => {
    it('text (default) applies theme.radii.sm border radius (4px)', () => {
      renderWithTheme(<Skeleton data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ borderRadius: '4px' })
    })

    it('circular applies 50% border radius', () => {
      renderWithTheme(<Skeleton variant="circular" data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ borderRadius: '50%' })
    })

    it('rectangular applies theme.radii.sq border radius (0)', () => {
      renderWithTheme(<Skeleton variant="rectangular" data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ borderRadius: '0' })
    })

    it('does not forward variant to the DOM', () => {
      renderWithTheme(<Skeleton variant="circular" data-testid="sk" />)
      expect(screen.getByTestId('sk')).not.toHaveAttribute('variant')
    })
  })

  // ─── borderRadius ──────────────────────────────────────────────────────────────

  describe('borderRadius', () => {
    it('resolves a theme.radii token (md → 8px)', () => {
      renderWithTheme(<Skeleton variant="rectangular" borderRadius="md" data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ borderRadius: '8px' })
    })

    it('resolves theme.radii.lg to 16px', () => {
      renderWithTheme(<Skeleton variant="rectangular" borderRadius="lg" data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ borderRadius: '16px' })
    })

    it('passes a raw px value through unchanged', () => {
      renderWithTheme(<Skeleton variant="rectangular" borderRadius="12px" data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ borderRadius: '12px' })
    })

    it('overrides the variant default radius (text sm → lg)', () => {
      renderWithTheme(<Skeleton variant="text" borderRadius="lg" data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ borderRadius: '16px' })
    })

    it('is ignored for the circular variant — the circle stays 50%', () => {
      renderWithTheme(<Skeleton variant="circular" borderRadius="sm" data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ borderRadius: '50%' })
    })

    it('does not forward borderRadius to the DOM', () => {
      renderWithTheme(<Skeleton borderRadius="md" data-testid="sk" />)
      expect(screen.getByTestId('sk')).not.toHaveAttribute('borderRadius')
    })
  })

  // ─── dimensions ────────────────────────────────────────────────────────────────

  describe('dimensions', () => {
    it('numeric width and height resolve to px', () => {
      renderWithTheme(<Skeleton variant="rectangular" width={200} height={80} data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ width: '200px', height: '80px' })
    })

    it('string width and height pass through unchanged', () => {
      renderWithTheme(
        <Skeleton variant="rectangular" width="10rem" height="50%" data-testid="sk" />
      )
      expect(screen.getByTestId('sk')).toHaveStyle({ width: '10rem', height: '50%' })
    })

    it('does not forward width or height to the DOM', () => {
      renderWithTheme(<Skeleton variant="rectangular" width={200} height={80} data-testid="sk" />)
      const el = screen.getByTestId('sk')
      expect(el).not.toHaveAttribute('width')
      expect(el).not.toHaveAttribute('height')
    })
  })

  // ─── children inference ──────────────────────────────────────────────────────────

  describe('children', () => {
    it('renders children invisibly to infer size and sets width to fit-content', () => {
      renderWithTheme(<Skeleton data-testid="sk">Loading title</Skeleton>)
      const el = screen.getByTestId('sk')
      expect(el).toHaveStyle({ width: 'fit-content' })
      const content = screen.getByText('Loading title')
      expect(content).toBeInTheDocument()
      expect(content).toHaveStyle({ visibility: 'hidden' })
    })

    it('an explicit width overrides fit-content when children are present', () => {
      renderWithTheme(
        <Skeleton width={300} data-testid="sk">
          Loading title
        </Skeleton>
      )
      expect(screen.getByTestId('sk')).toHaveStyle({ width: '300px' })
    })

    it('treats an empty string child as no children', () => {
      renderWithTheme(<Skeleton data-testid="sk">{''}</Skeleton>)
      const el = screen.getByTestId('sk')
      expect(el).not.toHaveStyle({ width: 'fit-content' })
      expect(el).toBeEmptyDOMElement()
    })
  })

  // ─── animation ─────────────────────────────────────────────────────────────────

  describe('animation', () => {
    it('wave applies the viewport-anchored shimmer', () => {
      renderWithTheme(<Skeleton animation="wave" data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ backgroundAttachment: 'fixed' })
    })

    it('pulse (default) does not use the wave shimmer', () => {
      renderWithTheme(<Skeleton data-testid="sk" />)
      expect(screen.getByTestId('sk')).not.toHaveStyle({ backgroundAttachment: 'fixed' })
    })

    it('pulse, wave, and false each produce a distinct class', () => {
      const { rerender } = renderWithTheme(<Skeleton animation="pulse" data-testid="sk" />)
      const pulseClass = screen.getByTestId('sk').getAttribute('class')

      rerender(<Skeleton animation="wave" data-testid="sk" />)
      const waveClass = screen.getByTestId('sk').getAttribute('class')

      rerender(<Skeleton animation={false} data-testid="sk" />)
      const noneClass = screen.getByTestId('sk').getAttribute('class')

      expect(pulseClass).not.toBe(waveClass)
      expect(waveClass).not.toBe(noneClass)
      expect(pulseClass).not.toBe(noneClass)
    })

    it('does not forward animation to the DOM', () => {
      renderWithTheme(<Skeleton animation="wave" data-testid="sk" />)
      expect(screen.getByTestId('sk')).not.toHaveAttribute('animation')
    })
  })

  // ─── HTML attribute passthrough ────────────────────────────────────────────────

  describe('HTML attribute passthrough', () => {
    it('forwards className', () => {
      renderWithTheme(<Skeleton className="custom" data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveClass('custom')
    })

    it('forwards aria attributes', () => {
      renderWithTheme(<Skeleton aria-hidden data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies margin from theme.space via the m prop', () => {
      renderWithTheme(<Skeleton m={2} data-testid="sk" />)
      expect(screen.getByTestId('sk')).toHaveStyle({ margin: dark.space[2] as string })
    })
  })
})
