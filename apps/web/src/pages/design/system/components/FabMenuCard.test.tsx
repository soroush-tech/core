import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { FabMenuCard } from './FabMenuCard'

describe('FabMenuCard', () => {
  it('renders the card title with the menu closed', () => {
    renderWithTheme(<FabMenuCard />)
    expect(screen.getByText('FAB_MENU')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('LAST_ACTION: NONE')).toBeInTheDocument()
  })

  it('records the chosen action', async () => {
    renderWithTheme(<FabMenuCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('aria-expanded', 'true')
    // The actions zoom in, hidden until the transition starts.
    fireEvent.click(await screen.findByRole('button', { name: 'NEW_FOLDER' }))
    expect(screen.getByText('LAST_ACTION: NEW_FOLDER')).toBeInTheDocument()
  })
})
