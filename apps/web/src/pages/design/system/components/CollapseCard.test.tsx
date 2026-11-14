import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { CollapseCard } from './CollapseCard'

describe('CollapseCard', () => {
  it('renders the card title with the target shown', () => {
    renderWithTheme(<CollapseCard />)
    expect(screen.getByText('COLLAPSE')).toBeInTheDocument()
    expect(screen.getByText('COLLAPSE_TARGET')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'HIDE' })).toBeInTheDocument()
  })

  it('toggles the target out and back in', () => {
    renderWithTheme(<CollapseCard />)
    fireEvent.click(screen.getByRole('button', { name: 'HIDE' }))
    expect(screen.getByRole('button', { name: 'SHOW' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'SHOW' }))
    expect(screen.getByRole('button', { name: 'HIDE' })).toBeInTheDocument()
    expect(screen.getByText('COLLAPSE_TARGET')).toBeInTheDocument()
  })
})
