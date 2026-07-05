import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { PackageIndex } from './PackageIndex'
import { packages } from './PackageIndex.data'

describe('PackageIndex', () => {
  it('renders the page heading', () => {
    renderWithTheme(<PackageIndex />)
    expect(screen.getByRole('heading', { level: 1, name: 'NPM Packages' })).toBeInTheDocument()
  })

  it('renders a DomainCard per package titled with its name', () => {
    renderWithTheme(<PackageIndex />)
    for (const pkg of packages) {
      expect(screen.getByRole('heading', { level: 2, name: pkg.name })).toBeInTheDocument()
    }
  })

  it('wraps each card in a link to its href, opening external npm links in a new tab', () => {
    renderWithTheme(<PackageIndex />)
    for (const pkg of packages) {
      const link = screen.getByRole('link', { name: pkg.name })
      expect(link).toHaveAttribute('href', pkg.href)
      if (pkg.target) {
        expect(link).toHaveAttribute('target', pkg.target)
      } else {
        expect(link).not.toHaveAttribute('target')
      }
    }
  })

  it('renders each package description', () => {
    renderWithTheme(<PackageIndex />)
    for (const pkg of packages) {
      expect(screen.getByText(pkg.description)).toBeInTheDocument()
    }
  })

  it("renders every package's keywords as tags", () => {
    renderWithTheme(<PackageIndex />)
    for (const pkg of packages) {
      for (const keyword of pkg.keywords) {
        expect(screen.getAllByText(keyword).length).toBeGreaterThan(0)
      }
    }
  })

  it('shows each package version as the card badge', () => {
    renderWithTheme(<PackageIndex />)
    for (const pkg of packages) {
      expect(screen.getAllByText(`v${pkg.version}`).length).toBeGreaterThan(0)
    }
  })
})
