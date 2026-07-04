import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { AboutHero } from './AboutHero'

describe('AboutHero', () => {
  describe('element', () => {
    it('renders as a section element', () => {
      renderWithTheme(<AboutHero />)
      expect(document.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('headline', () => {
    it('renders the h1 with both lines', () => {
      renderWithTheme(<AboutHero />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('18 Years of')
      expect(heading).toHaveTextContent('Software Evolution')
    })

    it('renders the subtitle', () => {
      renderWithTheme(<AboutHero />)
      expect(
        screen.getByText(/Engineering high-performance cross-platform ecosystems/)
      ).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('renders the VIEW_EXPERTISE link to /domain', () => {
      renderWithTheme(<AboutHero />)
      expect(screen.getByRole('link', { name: 'VIEW_EXPERTISE' })).toHaveAttribute(
        'href',
        '/domain/'
      )
    })

    it('renders the CONNECT_SOCIAL link to LinkedIn', () => {
      renderWithTheme(<AboutHero />)
      expect(screen.getByRole('link', { name: 'CONNECT_SOCIAL' })).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/masoud-soroush-4139b152'
      )
    })
  })

  describe('portrait', () => {
    it('renders the portrait with a descriptive alt', () => {
      renderWithTheme(<AboutHero />)
      expect(
        screen.getByRole('img', { name: 'Portrait of Masoud Soroush, Principal Software Engineer' })
      ).toBeInTheDocument()
    })

    it.each(['LOC: BERLIN, DE', 'TZ: UTC+1', 'VERSION: 2026.Q2'])(
      'renders the %s HUD readout',
      (text) => {
        renderWithTheme(<AboutHero />)
        expect(screen.getByText(text)).toBeInTheDocument()
      }
    )
  })
})
