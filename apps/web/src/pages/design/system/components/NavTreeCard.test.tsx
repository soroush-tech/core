import { screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { NavTreeCard } from './NavTreeCard'

describe('NavTreeCard', () => {
  it('renders the groups inside a named navigation', () => {
    renderWithTheme(<NavTreeCard />)
    expect(screen.getByText('NAV_TREE')).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Documentation' })
    expect(within(nav).getByText('Get started')).toBeInTheDocument()
    expect(within(nav).getByText('Components')).toBeInTheDocument()
  })

  it('marks the current page and keeps the other links plain', () => {
    renderWithTheme(<NavTreeCard />)
    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Installation' })).not.toHaveAttribute('aria-current')
  })

  it('shows a link note beside its name', () => {
    renderWithTheme(<NavTreeCard />)
    expect(screen.getByText('v2')).toBeInTheDocument()
  })
})
