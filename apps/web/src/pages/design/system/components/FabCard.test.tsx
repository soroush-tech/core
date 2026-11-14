import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { FabCard } from './FabCard'

describe('FabCard', () => {
  it('renders the circular and extended fabs', () => {
    renderWithTheme(<FabCard />)
    expect(screen.getByText('FAB')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CREATE' })).toBeInTheDocument()
  })

  it('collapses and extends the extended fab', () => {
    renderWithTheme(<FabCard />)
    fireEvent.click(screen.getByRole('button', { name: 'COLLAPSE_FAB' }))
    const extend = screen.getByRole('button', { name: 'EXTEND_FAB' })
    expect(extend).toHaveAttribute('aria-pressed', 'true')
    // A collapsed fab keeps its label in the tree, so it keeps its name.
    expect(screen.getByRole('button', { name: 'CREATE' })).toBeInTheDocument()
    fireEvent.click(extend)
    expect(screen.getByRole('button', { name: 'COLLAPSE_FAB' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })
})
