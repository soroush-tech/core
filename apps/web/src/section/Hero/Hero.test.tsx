import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Hero } from './Hero'

describe('Hero', () => {
  describe('element', () => {
    it('renders as a section element', () => {
      renderWithTheme(<Hero />)
      expect(document.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('content', () => {
    it('renders the role label', () => {
      renderWithTheme(<Hero />)
      expect(screen.getByText('Principal Software Engineer')).toBeInTheDocument()
    })

    it('renders the h1 heading', () => {
      renderWithTheme(<Hero />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('renders "Building" in the heading', () => {
      renderWithTheme(<Hero />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building')
    })

    it('renders the accent text', () => {
      renderWithTheme(<Hero />)
      expect(screen.getByText(/High.Performance/)).toBeInTheDocument()
    })

    it('renders the description', () => {
      renderWithTheme(<Hero />)
      expect(screen.getByText(/Engineering scalable, low-latency systems/)).toBeInTheDocument()
    })
  })

  describe('CTAs', () => {
    it('renders the Inquire link to the contact page', () => {
      renderWithTheme(<Hero />)
      expect(screen.getByRole('link', { name: /inquire/i })).toHaveAttribute('href', '/contact/')
    })
  })
})
