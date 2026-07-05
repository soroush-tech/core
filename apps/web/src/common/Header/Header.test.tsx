import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, within } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { dark } from 'src/theme/themes'

vi.mock('src/common/NavLink', () => ({
  NavLink: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const { mockToggleTheme, mockUseThemeMode } = vi.hoisted(() => ({
  mockToggleTheme: vi.fn(),
  mockUseThemeMode: vi.fn(() => ({ isDark: true, toggleTheme: vi.fn() })),
}))

vi.mock('src/theme/hooks/useThemeMode', () => ({
  useThemeMode: mockUseThemeMode,
}))

import { Header } from '../Header'

describe('Header', () => {
  beforeEach(() => {
    mockToggleTheme.mockReset()
    mockUseThemeMode.mockReturnValue({ isDark: true, toggleTheme: mockToggleTheme })
  })

  afterEach(() => {
    document.body.removeAttribute('style')
  })

  describe('logo', () => {
    it('renders the logo image', () => {
      renderWithTheme(<Header />)
      expect(screen.getByAltText('Soroush logo')).toBeInTheDocument()
    })

    it('renders a link to the homepage for the logo', () => {
      renderWithTheme(<Header />)
      expect(screen.getByRole('link', { name: 'Soroush logo' })).toHaveAttribute(
        'href',
        'https://soroush.tech'
      )
    })

    it('renders the site name', () => {
      renderWithTheme(<Header />)
      expect(screen.getByText('SOROUSH™')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('renders Home, About, Packages, and Articles nav links', () => {
      renderWithTheme(<Header />)
      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about/')
      expect(screen.getByRole('link', { name: 'Packages' })).toHaveAttribute('href', '/npm/')
      expect(screen.getByRole('link', { name: 'Articles' })).toHaveAttribute('href', '/articles/')
    })

    it('wraps nav links in a nav element', () => {
      renderWithTheme(<Header />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  describe('theme switch', () => {
    it('renders the theme toggle switch', () => {
      renderWithTheme(<Header />)
      expect(screen.getByRole('switch', { name: 'Toggle theme' })).toBeInTheDocument()
    })

    it('switch is checked when isDark is true', () => {
      renderWithTheme(<Header />)
      expect(screen.getByRole('switch', { name: 'Toggle theme' })).toBeChecked()
    })

    it('calls toggleTheme when the switch is clicked', () => {
      renderWithTheme(<Header />)
      fireEvent.click(screen.getByRole('switch', { name: 'Toggle theme' }))
      expect(mockToggleTheme).toHaveBeenCalledOnce()
    })

    it('renders the MODE label', () => {
      renderWithTheme(<Header />)
      expect(screen.getByText('MODE')).toBeInTheDocument()
    })

    it('renders the sun icon when isDark is false', () => {
      mockUseThemeMode.mockReturnValue({ isDark: false, toggleTheme: mockToggleTheme })
      renderWithTheme(<Header />)
      expect(screen.getByRole('switch', { name: 'Toggle theme' })).not.toBeChecked()
    })
  })

  describe('AppBar root', () => {
    it('renders as a header element', () => {
      renderWithTheme(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('layers the header at theme.zOrder.appBar', () => {
      renderWithTheme(<Header />)
      expect(screen.getByRole('banner')).toHaveStyle({ zIndex: dark.zOrder.appBar })
    })
  })

  describe('position prop', () => {
    it('defaults to fixed', () => {
      renderWithTheme(<Header />)
      expect(screen.getByRole('banner')).toHaveStyle({ position: 'fixed' })
    })

    it('forwards position to AppBar', () => {
      renderWithTheme(<Header position="static" />)
      expect(screen.getByRole('banner')).toHaveStyle({ position: 'static' })
    })
  })

  describe('mobile menu', () => {
    // The hamburger lives in a mobile-only (display:none on desktop) wrapper; jsdom
    // does not apply the mobile media query, so query it with `hidden: true`.
    const getHamburger = () => screen.getByRole('button', { name: 'Open menu', hidden: true })
    const openMenu = () => fireEvent.click(getHamburger())

    it('renders a hamburger button labelled "Open menu", collapsed by default', () => {
      renderWithTheme(<Header />)
      expect(getHamburger()).toHaveAttribute('aria-expanded', 'false')
    })

    it('does not render the mobile nav until the menu is opened', () => {
      renderWithTheme(<Header />)
      expect(screen.queryByRole('navigation', { name: 'Mobile' })).toBeNull()
    })

    it('opens the drawer with the nav when the hamburger is clicked', () => {
      renderWithTheme(<Header />)
      openMenu()
      expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument()
      expect(getHamburger()).toHaveAttribute('aria-expanded', 'true')
    })

    it('closes the drawer when a mobile nav link is selected', () => {
      renderWithTheme(<Header />)
      openMenu()
      const mobileNav = screen.getByRole('navigation', { name: 'Mobile' })
      fireEvent.click(within(mobileNav).getByRole('link', { name: 'About' }))
      expect(screen.queryByRole('navigation', { name: 'Mobile' })).toBeNull()
    })

    it('closes the drawer on Escape', () => {
      renderWithTheme(<Header />)
      openMenu()
      fireEvent.keyDown(document.querySelector('[role="presentation"]') as HTMLElement, {
        key: 'Escape',
      })
      expect(screen.queryByRole('navigation', { name: 'Mobile' })).toBeNull()
    })
  })
})
