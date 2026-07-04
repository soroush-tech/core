import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'

vi.mock('src/common/NavLink', () => ({
  NavLink: ({
    href,
    target,
    children,
  }: {
    href: string
    target?: string
    children: React.ReactNode
  }) => (
    <a href={href} target={target}>
      {children}
    </a>
  ),
}))

import { Footer } from './Footer'

describe('Footer', () => {
  describe('branding', () => {
    it('renders the logo image', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByAltText('Soroush logo')).toBeInTheDocument()
    })

    it('renders the site name', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByText('SOROUSH.TECH')).toBeInTheDocument()
    })

    it('renders the tagline', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByText(/Built for speed, scaled for eternity/)).toBeInTheDocument()
    })
  })

  describe('directories', () => {
    it('renders the Directories heading', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByText('Directories')).toBeInTheDocument()
    })

    it('renders Design System link to /design/system', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByRole('link', { name: 'Design System' })).toHaveAttribute(
        'href',
        '/design/system/'
      )
    })

    it('renders Delivery Domain link to /domain', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByRole('link', { name: 'Delivery Domain' })).toHaveAttribute(
        'href',
        '/domain/'
      )
    })

    it('renders AI Automation link to /about', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByRole('link', { name: 'AI Automation' })).toHaveAttribute('href', '/about/')
    })

    it('renders Contacts link to /contact', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByRole('link', { name: 'Contacts' })).toHaveAttribute('href', '/contact/')
    })
  })

  describe('connectivity', () => {
    it('renders the Connectivity heading', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByText('Connectivity')).toBeInTheDocument()
    })

    it('renders GitHub Repository link', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByRole('link', { name: 'GitHub Repository' })).toHaveAttribute(
        'href',
        'https://github.com/soroushm'
      )
    })

    it('renders NPM Packages link', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByRole('link', { name: 'NPM Packages' })).toHaveAttribute('href', '/npm/')
    })

    it('renders Technical Wiki link', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByRole('link', { name: 'Technical Wiki' })).toHaveAttribute('href', '/wiki/')
    })

    it('opens external links in a new tab', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByRole('link', { name: 'GitHub Repository' })).toHaveAttribute(
        'target',
        '_blank'
      )
    })
  })

  describe('terminal readout', () => {
    it('renders the SYSTEM_OUTPUT label', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByText('SYSTEM_OUTPUT')).toBeInTheDocument()
    })

    it('renders the diagnostic text', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByText('Running diagnostic sequence... OK')).toBeInTheDocument()
    })
  })

  describe('copyright', () => {
    it('renders the copyright notice', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByText(/SOROUSH\.TECH\. ALL RIGHTS RESERVED/)).toBeInTheDocument()
    })

    it('includes the current year in the copyright', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
    })
  })

  describe('structure', () => {
    it('renders as a footer element', () => {
      renderWithTheme(<Footer />)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })
  })
})
