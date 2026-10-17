import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { DrawerCard } from './DrawerCard'

describe('DrawerCard', () => {
  it('renders the card title and one trigger per anchor', () => {
    renderWithTheme(<DrawerCard />)
    expect(screen.getByText('DRAWER')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'LEFT' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'RIGHT' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TOP' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'BOTTOM' })).toBeInTheDocument()
  })

  it('is closed initially', () => {
    renderWithTheme(<DrawerCard />)
    // A popover drawer's content is always in the page, hidden while closed
    expect(screen.getByText('DRAWER_LEFT')).not.toBeVisible()
  })

  it('opens the drawer at the clicked anchor', () => {
    renderWithTheme(<DrawerCard />)
    fireEvent.click(screen.getByRole('button', { name: 'RIGHT' }))
    expect(screen.getByText('DRAWER_RIGHT')).toBeInTheDocument()
  })

  it('closes on Escape', () => {
    renderWithTheme(<DrawerCard />)
    fireEvent.click(screen.getByRole('button', { name: 'TOP' }))
    fireEvent.keyDown(screen.getByText('DRAWER_TOP'), { key: 'Escape' })
    expect(screen.queryByText('DRAWER_TOP')).not.toBeInTheDocument()
  })
})
