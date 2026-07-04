import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { DeliveryDomains } from './DeliveryDomains'
import { domains } from './DeliveryDomains.data'

describe('DeliveryDomains', () => {
  describe('element', () => {
    it('renders as a section element', () => {
      renderWithTheme(<DeliveryDomains />)
      expect(document.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('header', () => {
    it('renders the heading', () => {
      renderWithTheme(<DeliveryDomains />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Delivery Domains')
    })

    it('links to the full domain page', () => {
      renderWithTheme(<DeliveryDomains />)
      expect(screen.getByRole('link', { name: 'ALL_DOMAINS' })).toHaveAttribute('href', '/domain/')
    })
  })

  describe('domains', () => {
    it.each(domains)('renders the $title card with its stack', ({ title, stack }) => {
      renderWithTheme(<DeliveryDomains />)
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument()
      expect(screen.getByText(stack)).toBeInTheDocument()
    })
  })
})
