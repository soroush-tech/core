import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { ButtonGroupCard } from './ButtonGroupCard'

describe('ButtonGroupCard', () => {
  it('renders the card title', () => {
    renderWithTheme(<ButtonGroupCard />)
    expect(screen.getByText('BUTTON_GROUP')).toBeInTheDocument()
  })

  it('renders one group per variant', () => {
    renderWithTheme(<ButtonGroupCard />)
    expect(screen.getByRole('group', { name: 'contained button group' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'outlined button group' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'text button group' })).toBeInTheDocument()
  })

  it('switches the exclusive toggle selection', () => {
    renderWithTheme(<ButtonGroupCard />)
    expect(screen.getByText('VIEW_MODE=GRID')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'LIST' }))
    expect(screen.getByText('VIEW_MODE=LIST')).toBeInTheDocument()
  })

  it('clears the selection when the active toggle is clicked again', () => {
    renderWithTheme(<ButtonGroupCard />)
    fireEvent.click(screen.getByRole('button', { name: 'GRID' }))
    expect(screen.getByText('VIEW_MODE=NONE')).toBeInTheDocument()
  })
})
