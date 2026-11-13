import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { ChipCard } from './ChipCard'

describe('ChipCard', () => {
  it('renders the card title and the static chips', () => {
    renderWithTheme(<ChipCard />)
    expect(screen.getByText('CHIP')).toBeInTheDocument()
    for (const label of ['DEFAULT', 'PRIMARY', 'OUTLINED', 'CODE']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('toggles the clickable chip', () => {
    renderWithTheme(<ChipCard />)
    fireEvent.click(screen.getByRole('button', { name: 'SELECT_ME' }))
    expect(screen.getByRole('button', { name: 'SELECTED' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'SELECTED' }))
    expect(screen.getByRole('button', { name: 'SELECT_ME' })).toBeInTheDocument()
  })

  it('deletes tags and resets them once all are gone', () => {
    renderWithTheme(<ChipCard />)
    expect(screen.queryByRole('button', { name: 'RESET_TAGS' })).not.toBeInTheDocument()
    for (const tag of ['REACT', 'TYPESCRIPT', 'VITE']) {
      fireEvent.click(screen.getByRole('button', { name: `Remove ${tag}` }))
      expect(screen.queryByText(tag)).not.toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: 'RESET_TAGS' }))
    expect(screen.getByText('REACT')).toBeInTheDocument()
    expect(screen.getByText('VITE')).toBeInTheDocument()
  })
})
