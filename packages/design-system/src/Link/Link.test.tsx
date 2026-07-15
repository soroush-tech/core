import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../themes'
import { Link } from '../Link'

describe('Link', () => {
  describe('element', () => {
    it('renders an anchor element', () => {
      renderWithTheme(<Link href="/">Home</Link>)
      expect(screen.getByText('Home').tagName).toBe('A')
    })
  })

  describe('children', () => {
    it('renders children', () => {
      renderWithTheme(<Link href="https://example.com">Example Link</Link>)
      expect(screen.getByText('Example Link')).toBeInTheDocument()
    })
  })

  describe('underline', () => {
    it('applies underline text-decoration by default', () => {
      renderWithTheme(
        <Link href="/" data-testid="link">
          Link
        </Link>
      )
      expect(screen.getByTestId('link')).toHaveStyle({ textDecoration: 'underline' })
    })

    it('applies no decoration when underline is none', () => {
      renderWithTheme(
        <Link href="/" underline="none" data-testid="link">
          Link
        </Link>
      )
      expect(screen.getByTestId('link')).toHaveStyle({ textDecoration: 'none' })
    })

    it('applies no decoration at rest when underline is hover', () => {
      renderWithTheme(
        <Link href="/" underline="hover" data-testid="link">
          Link
        </Link>
      )
      expect(screen.getByTestId('link')).toHaveStyle({ textDecoration: 'none' })
    })
  })

  describe('color', () => {
    it('defaults to the primary text color', () => {
      renderWithTheme(
        <Link href="/" data-testid="link">
          Link
        </Link>
      )
      expect(screen.getByTestId('link')).toHaveStyle({ color: baseTheme.text.primary })
    })

    it('sets an explicit color on :hover to prevent global a:hover overrides', () => {
      // &:hover rules aren't applied by jsdom — verify the generated stylesheet contains
      // a :hover rule for the link's class that includes a color declaration.
      renderWithTheme(
        <Link href="/" color="secondary" data-testid="link">
          Link
        </Link>
      )
      const el = screen.getByTestId('link')
      const allRules = Array.from(document.styleSheets).flatMap((s) => {
        try {
          return Array.from(s.cssRules)
        } catch {
          return []
        }
      })
      const linkClasses = Array.from(el.classList)
      const hasHoverColorRule = allRules.some((rule) => {
        const text = rule.cssText
        return (
          linkClasses.some((cls) => text.includes(cls)) &&
          text.includes(':hover') &&
          text.includes('color')
        )
      })
      expect(hasHoverColorRule).toBe(true)
    })

    it('applies each text color token without error', () => {
      const tokens = (Object.keys(baseTheme.text) as (keyof typeof baseTheme.text)[]).filter(
        (t) => baseTheme.text[t] !== 'inherit'
      )
      tokens.forEach((token) => {
        const { unmount } = renderWithTheme(
          <Link href="/" color={token} data-testid="link">
            Link
          </Link>
        )
        expect(screen.getByTestId('link')).toHaveStyle({ color: baseTheme.text[token] })
        unmount()
      })
    })
  })

  describe('variant', () => {
    it('renders without error when using the default inherit variant', () => {
      renderWithTheme(
        <Link href="/" data-testid="link">
          Link
        </Link>
      )
      expect(screen.getByTestId('link')).toBeInTheDocument()
    })

    it('applies variant typography styles', () => {
      renderWithTheme(
        <Link href="/" variant="body1" data-testid="link">
          Link
        </Link>
      )
      // body1 → fontSizes index 2 = 16
      expect(screen.getByTestId('link')).toHaveStyle({ fontSize: `${baseTheme.fontSizes[2]}px` })
    })
  })

  describe('target', () => {
    it('is not set when omitted', () => {
      renderWithTheme(
        <Link href="/" data-testid="link">
          Link
        </Link>
      )
      expect(screen.getByTestId('link')).not.toHaveAttribute('target')
    })

    it.each(['_self', '_blank', '_parent', '_top', '_unfencedTop'])(
      'forwards target="%s" to the anchor element',
      (target) => {
        renderWithTheme(
          <Link href="/" target={target} data-testid="link">
            Link
          </Link>
        )
        expect(screen.getByTestId('link')).toHaveAttribute('target', target)
      }
    )
  })

  describe('target="_blank" auto-rel', () => {
    it('injects rel="noopener noreferrer" when target="_blank" and no rel provided', () => {
      renderWithTheme(
        <Link href="https://example.com" target="_blank" data-testid="link">
          External
        </Link>
      )
      expect(screen.getByTestId('link')).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('does not override an explicit rel when target="_blank"', () => {
      renderWithTheme(
        <Link href="https://example.com" target="_blank" rel="noopener" data-testid="link">
          External
        </Link>
      )
      expect(screen.getByTestId('link')).toHaveAttribute('rel', 'noopener')
    })

    it('does not add rel when target is not "_blank"', () => {
      renderWithTheme(
        <Link href="/" target="_self" data-testid="link">
          Same-tab
        </Link>
      )
      expect(screen.getByTestId('link')).not.toHaveAttribute('rel')
    })
  })

  describe('HTML passthrough', () => {
    it('forwards href', () => {
      renderWithTheme(<Link href="https://example.com">Link</Link>)
      expect(screen.getByText('Link')).toHaveAttribute('href', 'https://example.com')
    })

    it('forwards className', () => {
      renderWithTheme(
        <Link href="/" className="custom">
          Link
        </Link>
      )
      expect(screen.getByText('Link')).toHaveClass('custom')
    })

    it('forwards aria-label', () => {
      renderWithTheme(
        <Link href="/" aria-label="go home">
          Link
        </Link>
      )
      expect(screen.getByText('Link')).toHaveAttribute('aria-label', 'go home')
    })

    it('forwards data-* attributes', () => {
      renderWithTheme(
        <Link href="/" data-testid="nav-link">
          Link
        </Link>
      )
      expect(screen.getByTestId('nav-link')).toBeInTheDocument()
    })
  })

  describe('spacing', () => {
    it('applies padding from theme.space', () => {
      renderWithTheme(
        <Link href="/" p={1} data-testid="link">
          Link
        </Link>
      )
      expect(screen.getByTestId('link')).toHaveStyle({ padding: baseTheme.space[1] })
    })
  })
})
