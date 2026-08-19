import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'

const { capturedProps } = vi.hoisted(() => ({
  capturedProps: [] as Array<{ href: string; [key: string]: unknown }>,
}))

vi.mock('src/common/NavLink', () => ({
  NavLink: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => {
    capturedProps.push({ href, ...rest })
    return <a href={href}>{children}</a>
  },
}))

import { Navbar } from './Navbar'

const ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/articles', label: 'Articles' },
]

describe('Navbar', () => {
  beforeEach(() => {
    capturedProps.length = 0
  })

  describe('landmark', () => {
    it('renders a nav element', () => {
      renderWithTheme(<Navbar items={ITEMS} aria-label="Main" />)
      expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    })

    it('forwards aria-label to the nav element', () => {
      renderWithTheme(<Navbar items={ITEMS} aria-label="Directories" />)
      expect(screen.getByRole('navigation', { name: 'Directories' })).toBeInTheDocument()
    })
  })

  describe('items', () => {
    it('renders all items with correct hrefs and labels', () => {
      renderWithTheme(<Navbar items={ITEMS} />)
      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
      expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
      expect(screen.getByRole('link', { name: 'Articles' })).toHaveAttribute('href', '/articles')
    })

    it('renders exactly one link per item', () => {
      renderWithTheme(<Navbar items={ITEMS} />)
      expect(screen.getAllByRole('link')).toHaveLength(ITEMS.length)
    })

    it('sets aria-label on each link matching the item label', () => {
      renderWithTheme(<Navbar items={ITEMS} />)
      ITEMS.forEach(({ label }, i) => {
        expect(capturedProps[i]['aria-label']).toBe(label)
      })
    })
  })

  describe('active-link delegation', () => {
    it('does not pass a color prop - active color is delegated to NavLink', () => {
      renderWithTheme(<Navbar items={ITEMS} />)
      expect(capturedProps.every(({ color }) => color === undefined)).toBe(true)
    })
  })

  describe('direction', () => {
    it('renders in horizontal direction by default', () => {
      renderWithTheme(<Navbar items={ITEMS} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getAllByRole('link')).toHaveLength(ITEMS.length)
    })

    it('renders in vertical direction when direction="vertical"', () => {
      renderWithTheme(<Navbar items={ITEMS} direction="vertical" />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getAllByRole('link')).toHaveLength(ITEMS.length)
    })
  })

  describe('target', () => {
    it('passes target from item to NavLink', () => {
      const items = [{ href: 'https://example.com', label: 'External', target: '_blank' }]
      renderWithTheme(<Navbar items={items} />)
      expect(capturedProps[0].target).toBe('_blank')
    })

    it('omits target when not set on item', () => {
      renderWithTheme(<Navbar items={[ITEMS[0]]} />)
      expect(capturedProps[0].target).toBeUndefined()
    })
  })

  describe('prop forwarding', () => {
    it('forwards variant to each NavLink', () => {
      renderWithTheme(<Navbar items={ITEMS} variant="button" />)
      expect(capturedProps.every(({ variant }) => variant === 'button')).toBe(true)
    })

    it('forwards letterSpacing to each NavLink', () => {
      renderWithTheme(<Navbar items={ITEMS} letterSpacing="tight" />)
      expect(capturedProps.every(({ letterSpacing }) => letterSpacing === 'tight')).toBe(true)
    })

    it('forwards underline to each NavLink', () => {
      renderWithTheme(<Navbar items={ITEMS} underline="none" />)
      expect(capturedProps.every(({ underline }) => underline === 'none')).toBe(true)
    })
  })
})
