import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { dark, typography, fonts } from '../themes'
import { Typography, type TypographyVariant, type TextColorToken } from '../Typography'

describe('Typography', () => {
  // ─── children ────────────────────────────────────────────────────────────────

  describe('children', () => {
    it('renders text children', () => {
      renderWithTheme(<Typography>Hello World</Typography>)
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('renders element children', () => {
      renderWithTheme(
        <Typography>
          Hello <strong>bold</strong>
        </Typography>
      )
      expect(screen.getByText('bold')).toBeInTheDocument()
    })
  })

  // ─── variant → element mapping ───────────────────────────────────────────────

  describe('variant → element mapping', () => {
    const cases: Array<[TypographyVariant, string]> = [
      ['h1', 'H1'],
      ['h2', 'H2'],
      ['h3', 'H3'],
      ['h4', 'H4'],
      ['h5', 'H5'],
      ['h6', 'H6'],
      ['subtitle1', 'H6'],
      ['subtitle2', 'H6'],
      ['body1', 'P'],
      ['body2', 'P'],
      ['inherit', 'SPAN'],
      ['overline', 'SPAN'],
      ['button', 'SPAN'],
      ['caption', 'SPAN'],
    ]

    it.each(cases)('variant="%s" renders as <%s>', (variant, tag) => {
      renderWithTheme(<Typography variant={variant}>{variant}</Typography>)
      expect(screen.getByText(variant).tagName).toBe(tag)
    })

    it('defaults to body1 (renders as <p>)', () => {
      renderWithTheme(<Typography>default</Typography>)
      expect(screen.getByText('default').tagName).toBe('P')
    })

    it('variantMapping covers all 14 variants', () => {
      expect(Object.keys(typography)).toHaveLength(cases.length)
    })
  })

  // ─── variant visual styles ───────────────────────────────────────────────────

  describe('variant visual styles', () => {
    it('h1 applies 48px font size', () => {
      renderWithTheme(<Typography variant="h1">h1</Typography>)
      expect(screen.getByText('h1')).toHaveStyle({ fontSize: '48px' })
    })

    it('body1 applies 16px font size', () => {
      renderWithTheme(<Typography variant="body1">body</Typography>)
      expect(screen.getByText('body')).toHaveStyle({ fontSize: '16px' })
    })

    it('caption applies 12px font size', () => {
      renderWithTheme(<Typography variant="caption">cap</Typography>)
      expect(screen.getByText('cap')).toHaveStyle({ fontSize: '12px' })
    })

    it('individual props override variant styles', () => {
      renderWithTheme(
        <Typography variant="h1" fontSize={0}>
          override
        </Typography>
      )
      expect(screen.getByText('override')).toHaveStyle({ fontSize: '12px' })
    })
  })

  // ─── as prop ─────────────────────────────────────────────────────────────────

  describe('as prop', () => {
    it('overrides the element set by variant', () => {
      renderWithTheme(
        <Typography variant="h1" as="div">
          override
        </Typography>
      )
      expect(screen.getByText('override').tagName).toBe('DIV')
    })

    it('keeps variant styles when as overrides element', () => {
      renderWithTheme(
        <Typography variant="h1" as="div">
          styled-div
        </Typography>
      )
      expect(screen.getByText('styled-div')).toHaveStyle({ fontSize: '48px' })
    })
  })

  // ─── align ───────────────────────────────────────────────────────────────────

  describe('align', () => {
    it.each(['left', 'right', 'center', 'justify'] as const)(
      'align="%s" sets text-align',
      (align) => {
        renderWithTheme(<Typography align={align}>{align}</Typography>)
        expect(screen.getByText(align)).toHaveStyle({ textAlign: align })
      }
    )
  })

  // ─── noWrap ──────────────────────────────────────────────────────────────────

  describe('noWrap', () => {
    it('applies overflow ellipsis styles', () => {
      renderWithTheme(<Typography noWrap>truncated text</Typography>)
      expect(screen.getByText('truncated text')).toHaveStyle({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      })
    })

    it('does not apply truncation by default', () => {
      renderWithTheme(<Typography>normal text</Typography>)
      const el = screen.getByText('normal text')
      expect(el).not.toHaveStyle({ overflow: 'hidden' })
      expect(el).not.toHaveStyle({ whiteSpace: 'nowrap' })
    })
  })

  // ─── gutterBottom ────────────────────────────────────────────────────────────

  describe('gutterBottom', () => {
    it('applies margin-bottom: 0.5em', () => {
      renderWithTheme(<Typography gutterBottom>spaced</Typography>)
      expect(screen.getByText('spaced')).toHaveStyle({ marginBottom: '0.5em' })
    })

    it('does not add margin-bottom by default', () => {
      renderWithTheme(<Typography>no gutter</Typography>)
      expect(screen.getByText('no gutter')).not.toHaveStyle({ marginBottom: '0.5em' })
    })
  })

  // ─── theme scale props ───────────────────────────────────────────────────────

  describe('theme scale props', () => {
    describe('fontSize', () => {
      it.each([
        [0, '12px'],
        [1, '14px'],
        [2, '16px'],
        [3, '20px'],
        [4, '24px'],
        [5, '32px'],
        [6, '48px'],
      ] as const)('fontSize={%i} → %s', (index, px) => {
        renderWithTheme(<Typography fontSize={index}>{px}</Typography>)
        expect(screen.getByText(px)).toHaveStyle({ fontSize: px })
      })
    })

    describe('fontWeight', () => {
      it.each([
        ['normal', '400'],
        ['medium', '500'],
        ['semiBold', '600'],
        ['bold', '700'],
      ] as const)('fontWeight="%s" → %s', (keyword, weight) => {
        renderWithTheme(<Typography fontWeight={keyword}>{keyword}</Typography>)
        expect(screen.getByText(keyword)).toHaveStyle({ fontWeight: weight })
      })
    })

    describe('lineHeight', () => {
      it.each([
        ['none', '1'],
        ['tight', '1.2'],
        ['snug', '1.35'],
        ['base', '1.5'],
        ['relaxed', '1.625'],
        ['loose', '2'],
      ] as const)('lineHeight="%s" → %s', (keyword, value) => {
        renderWithTheme(<Typography lineHeight={keyword}>{keyword}</Typography>)
        expect(screen.getByText(keyword)).toHaveStyle({ lineHeight: value })
      })
    })

    describe('letterSpacing', () => {
      it.each([
        ['tighter', '-0.05em'],
        ['tight', '-0.025em'],
        ['normal', '0em'],
        ['wide', '0.05em'],
        ['wider', '0.1em'],
        ['widest', '0.2em'],
      ] as const)('letterSpacing="%s" → %s', (keyword, value) => {
        renderWithTheme(<Typography letterSpacing={keyword}>{keyword}</Typography>)
        expect(screen.getByText(keyword)).toHaveStyle({ letterSpacing: value })
      })
    })

    describe('fontFamily', () => {
      it('fontFamily="heading" applies the Space Grotesk stack', () => {
        renderWithTheme(<Typography fontFamily="heading">heading font</Typography>)
        expect(screen.getByText('heading font')).toHaveStyle({ fontFamily: fonts.heading })
      })

      it('fontFamily="mono" applies the monospace stack', () => {
        renderWithTheme(<Typography fontFamily="mono">mono font</Typography>)
        expect(screen.getByText('mono font')).toHaveStyle({ fontFamily: fonts.mono })
      })
    })
  })

  // ─── textTransform ───────────────────────────────────────────────────────────

  describe('textTransform', () => {
    it('applies textTransform="uppercase"', () => {
      renderWithTheme(<Typography textTransform="uppercase">upper</Typography>)
      expect(screen.getByText('upper')).toHaveStyle({ textTransform: 'uppercase' })
    })
  })

  // ─── color (theme.text scale) ────────────────────────────────────────────────

  describe('color resolves from theme.text', () => {
    const cases: Array<[TextColorToken, string]> = [
      ['initial', dark.text.initial],
      ['secondary', dark.text.secondary],
      ['error', dark.text.error],
      ['success', dark.text.success],
    ]

    it.each(cases)('color="%s" resolves to theme.text value', (token, expected) => {
      renderWithTheme(<Typography color={token}>{token}</Typography>)
      expect(screen.getByText(token)).toHaveStyle({ color: expected })
    })
  })

  // ─── space / layout props ────────────────────────────────────────────────────

  describe('space and layout props', () => {
    it('applies space props from theme scale', () => {
      renderWithTheme(
        <Typography mt={2} mb={1}>
          spaced
        </Typography>
      )
      expect(screen.getByText('spaced')).toHaveStyle({ marginTop: '16px', marginBottom: '8px' })
    })

    it('applies layout width prop', () => {
      renderWithTheme(<Typography width="200px">sized</Typography>)
      expect(screen.getByText('sized')).toHaveStyle({ width: '200px' })
    })
  })

  // ─── HTML attribute passthrough ───────────────────────────────────────────────

  describe('HTML attribute passthrough', () => {
    it('forwards style prop', () => {
      renderWithTheme(<Typography style={{ opacity: 0.5 }}>styled</Typography>)
      expect(screen.getByText('styled')).toHaveStyle({ opacity: '0.5' })
    })

    it('forwards className prop', () => {
      renderWithTheme(<Typography className="custom-class">classed</Typography>)
      expect(screen.getByText('classed')).toHaveClass('custom-class')
    })

    it('forwards data attributes', () => {
      renderWithTheme(<Typography data-testid="typo">data</Typography>)
      expect(screen.getByTestId('typo')).toBeInTheDocument()
    })
  })
})
