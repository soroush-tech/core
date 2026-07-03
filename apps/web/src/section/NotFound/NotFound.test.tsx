import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { NotFound } from './NotFound'

describe('NotFound', () => {
  describe('structure', () => {
    it('renders as a section element', () => {
      renderWithTheme(<NotFound />)
      expect(document.querySelector('section')).toBeInTheDocument()
    })

    it('renders the 404 heading', () => {
      renderWithTheme(<NotFound />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404')
    })

    it('renders the reassurance heading', () => {
      renderWithTheme(<NotFound />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent("Don't panic")
    })
  })

  describe('content', () => {
    it('renders the not-found message', () => {
      renderWithTheme(<NotFound />)
      expect(screen.getByText('This page does not exist in this dimension.')).toBeInTheDocument()
    })
  })

  describe('action', () => {
    it('links back to the home page', () => {
      renderWithTheme(<NotFound />)
      const link = screen.getByRole('link', { name: /back to the grid/i })
      expect(link).toHaveAttribute('href', '/')
    })
  })
})
