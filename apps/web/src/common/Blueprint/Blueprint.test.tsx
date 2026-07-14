import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { dark } from '@soroush.tech/design-system/themes'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Blueprint } from './Blueprint'

describe('Blueprint', () => {
  describe('children', () => {
    it('renders text children', () => {
      renderWithTheme(<Blueprint>content</Blueprint>)
      expect(screen.getByText('content')).toBeInTheDocument()
    })

    it('renders element children', () => {
      renderWithTheme(
        <Blueprint>
          <span>inner</span>
        </Blueprint>
      )
      expect(screen.getByText('inner')).toBeInTheDocument()
    })
  })

  describe('flex item', () => {
    it('applies flex prop', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" flex={1} />)
      expect(screen.getByTestId('blueprint')).toHaveStyle({ flex: '1 1 0%' })
    })
  })

  describe('layout', () => {
    it('is position relative', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" />)
      expect(screen.getByTestId('blueprint')).toHaveStyle({ position: 'relative' })
    })

    it('spans full width', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" />)
      expect(screen.getByTestId('blueprint')).toHaveStyle({ width: '100%' })
    })

    it('hides overflow', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" />)
      expect(screen.getByTestId('blueprint')).toHaveStyle({ overflow: 'hidden' })
    })

    it('allows height to be overridden', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" height="auto" />)
      expect(screen.getByTestId('blueprint')).toHaveStyle({ height: 'auto' })
    })

    it('allows overflow to be overridden', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" overflow="auto" />)
      expect(screen.getByTestId('blueprint')).toHaveStyle({ overflow: 'auto' })
    })
  })

  describe('variant', () => {
    it('uses line pattern by default', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" />)
      const el = screen.getByTestId('blueprint')
      expect(el).toHaveStyle({ backgroundSize: '40px 40px' })
    })

    it('uses dot pattern when variant is dot', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" variant="dot" />)
      const el = screen.getByTestId('blueprint')
      expect(el).toHaveStyle({ backgroundSize: '40px 40px' })
    })

    it('applies different background-image for dot vs line', () => {
      const { container: lineContainer } = renderWithTheme(
        <Blueprint data-testid="line" variant="line" />
      )
      const { container: dotContainer } = renderWithTheme(
        <Blueprint data-testid="dot" variant="dot" />
      )
      const lineStyle = getComputedStyle(lineContainer.firstElementChild!)
      const dotStyle = getComputedStyle(dotContainer.firstElementChild!)
      expect(lineStyle.backgroundImage).not.toBe(dotStyle.backgroundImage)
    })
  })

  describe('scanline', () => {
    it('renders scanline overlay when scanline prop is true', () => {
      const { container } = renderWithTheme(<Blueprint scanline />)
      expect(container.querySelector('span')).toBeInTheDocument()
    })

    it('does not render scanline overlay by default', () => {
      const { container } = renderWithTheme(<Blueprint />)
      expect(container.querySelector('span')).not.toBeInTheDocument()
    })
  })

  describe('spotlight', () => {
    it('renders the spotlight overlay by default', () => {
      const { container } = renderWithTheme(<Blueprint />)
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    })

    it('does not render the spotlight overlay when spotlight is false', () => {
      const { container } = renderWithTheme(<Blueprint spotlight={false} />)
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
    })

    it('does not forward the spotlight prop to the DOM', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" spotlight />)
      expect(screen.getByTestId('blueprint')).not.toHaveAttribute('spotlight')
    })
  })

  describe('theme tokens', () => {
    it('applies background.primary as background-color', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" />)
      expect(screen.getByTestId('blueprint')).toHaveStyle({
        backgroundColor: dark.background.primary,
      })
    })

    it('applies text.initial as color', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" />)
      expect(screen.getByTestId('blueprint')).toHaveStyle({ color: dark.text.initial })
    })

    it('applies fonts.body as font-family', () => {
      renderWithTheme(<Blueprint data-testid="blueprint" />)
      expect(screen.getByTestId('blueprint')).toHaveStyle({ fontFamily: dark.fonts.body })
    })
  })

  describe('HTML attribute passthrough', () => {
    it('forwards className', () => {
      renderWithTheme(
        <Blueprint className="custom" data-testid="blueprint">
          content
        </Blueprint>
      )
      expect(screen.getByTestId('blueprint')).toHaveClass('custom')
    })

    it('forwards data attributes', () => {
      renderWithTheme(<Blueprint data-testid="bp-el">content</Blueprint>)
      expect(screen.getByTestId('bp-el')).toBeInTheDocument()
    })

    it('forwards aria attributes', () => {
      renderWithTheme(<Blueprint aria-label="background canvas" data-testid="blueprint" />)
      expect(screen.getByTestId('blueprint')).toHaveAttribute('aria-label', 'background canvas')
    })
  })
})
