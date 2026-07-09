import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { PopoverCard } from './PopoverCard'

describe('PopoverCard', () => {
  it('renders the card title with the popover closed', () => {
    renderWithTheme(<PopoverCard />)
    expect(screen.getByText('POPOVER')).toBeInTheDocument()
    expect(screen.queryByText('ANCHORED_SURFACE')).not.toBeInTheDocument()
  })

  it('opens anchored to the trigger', () => {
    renderWithTheme(<PopoverCard />)
    fireEvent.click(screen.getByRole('button', { name: 'OPEN_POPOVER' }))
    expect(screen.getByText('ANCHORED_SURFACE')).toBeInTheDocument()
  })

  it('closes on Escape via onClose', () => {
    renderWithTheme(<PopoverCard />)
    fireEvent.click(screen.getByRole('button', { name: 'OPEN_POPOVER' }))
    fireEvent.keyDown(screen.getByText('ANCHORED_SURFACE'), { key: 'Escape' })
    expect(screen.queryByText('ANCHORED_SURFACE')).not.toBeInTheDocument()
  })
})
