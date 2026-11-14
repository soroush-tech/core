import { fireEvent, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { BreadcrumbsCard } from './BreadcrumbsCard'

describe('BreadcrumbsCard', () => {
  it('renders the short trail in full with the current page marked', () => {
    renderWithTheme(<BreadcrumbsCard />)
    expect(screen.getByText('BREADCRUMBS')).toBeInTheDocument()
    const trail = screen.getByRole('navigation', { name: 'Short trail' })
    expect(within(trail).getByRole('link', { name: 'HOME' })).toBeInTheDocument()
    expect(within(trail).getByRole('link', { name: 'DESIGN' })).toBeInTheDocument()
    expect(within(trail).getByText('SYSTEM')).toHaveAttribute('aria-current', 'page')
  })

  it('collapses the long trail and expands it on demand', () => {
    renderWithTheme(<BreadcrumbsCard />)
    const trail = screen.getByRole('navigation', { name: 'Long trail' })
    expect(within(trail).queryByRole('link', { name: 'COMPONENTS' })).not.toBeInTheDocument()

    fireEvent.click(within(trail).getByRole('button', { name: 'Show full path' }))

    expect(within(trail).getByRole('link', { name: 'COMPONENTS' })).toBeInTheDocument()
    expect(within(trail).getByText('NAVIGATION')).toHaveAttribute('aria-current', 'page')
  })
})
