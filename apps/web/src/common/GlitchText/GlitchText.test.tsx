import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { dark } from '@soroush.tech/design-system/themes'
import { GlitchText } from './GlitchText'

describe('GlitchText', () => {
  describe('render', () => {
    it('renders its children', () => {
      renderWithTheme(<GlitchText>404</GlitchText>)
      expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('renders as the element passed via `as`', () => {
      renderWithTheme(<GlitchText as="h1">404</GlitchText>)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404')
    })
  })

  describe('props', () => {
    it('forwards a responsive fontSize', () => {
      renderWithTheme(<GlitchText fontSize={[5, 6]}>404</GlitchText>)
      expect(screen.getByText('404')).toHaveStyle({ fontSize: '32px' })
    })

    it('maps color / secondaryColor onto the glitch CSS variables', () => {
      renderWithTheme(
        <GlitchText data-testid="glitch" color="secondary" secondaryColor="primary">
          404
        </GlitchText>
      )
      expect(screen.getByTestId('glitch')).toHaveStyle({
        '--glitch-a': dark.text.secondary,
        '--glitch-b': dark.text.primary,
      })
    })

    it('plays the inverted keyframes when `inverted` is set', () => {
      renderWithTheme(
        <>
          <GlitchText data-testid="normal">404</GlitchText>
          <GlitchText data-testid="inverted" inverted>
            404
          </GlitchText>
        </>
      )
      // The two variants use different keyframes, so emotion hashes them to different classes.
      expect(screen.getByTestId('inverted').className).not.toBe(
        screen.getByTestId('normal').className
      )
    })
  })

  describe('passthrough', () => {
    it('forwards className and data attributes', () => {
      renderWithTheme(
        <GlitchText className="custom" data-testid="glitch">
          404
        </GlitchText>
      )
      const el = screen.getByTestId('glitch')
      expect(el).toHaveClass('custom')
    })
  })
})
