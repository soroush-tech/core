import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { CallToAction } from './CallToAction'

describe('CallToAction', () => {
  describe('element', () => {
    it('renders as a section element', () => {
      renderWithTheme(<CallToAction />)
      expect(document.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('content', () => {
    it('renders the heading', () => {
      renderWithTheme(<CallToAction />)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('renders "Something" in the heading', () => {
      renderWithTheme(<CallToAction />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Something')
    })

    it('renders the "Great." accent', () => {
      renderWithTheme(<CallToAction />)
      expect(screen.getByText('Great.')).toBeInTheDocument()
    })

    it('renders the body text', () => {
      renderWithTheme(<CallToAction />)
      expect(
        screen.getByText(/Currently accepting high-impact development consulting/)
      ).toBeInTheDocument()
    })

    it('renders the decorative text as aria-hidden', () => {
      renderWithTheme(<CallToAction />)
      const decorative = document.querySelector('[aria-hidden="true"]')
      expect(decorative).toBeInTheDocument()
      expect(decorative).toHaveTextContent('ARCHITECT')
    })
  })

  describe('CTAs', () => {
    it('renders the Connect Now link to /contact', () => {
      renderWithTheme(<CallToAction />)
      const cta = screen.getByRole('link', { name: /Contact Now/i })
      expect(cta).toBeInTheDocument()
      expect(cta).toHaveAttribute('href', '/contact/')
    })
  })
})
