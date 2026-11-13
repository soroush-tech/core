import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { SidebarCard } from './SidebarCard'

describe('SidebarCard', () => {
  it('renders a collapsed rail landmark with the first item selected', () => {
    renderWithTheme(<SidebarCard />)
    expect(screen.getByText('SIDEBAR')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Showcase rail' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EXPAND_RAIL' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.getByRole('button', { name: 'HOME' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles the rail open and closed', () => {
    renderWithTheme(<SidebarCard />)
    fireEvent.click(screen.getByRole('button', { name: 'EXPAND_RAIL' }))
    const collapse = screen.getByRole('button', { name: 'COLLAPSE_RAIL' })
    expect(collapse).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(collapse)
    expect(screen.getByRole('button', { name: 'EXPAND_RAIL' })).toBeInTheDocument()
  })

  it('selects an item on press', () => {
    renderWithTheme(<SidebarCard />)
    fireEvent.click(screen.getByRole('button', { name: 'TERMINAL' }))
    expect(screen.getByRole('button', { name: 'TERMINAL' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'HOME' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('A shell in the project root.')).toBeInTheDocument()
  })
})
