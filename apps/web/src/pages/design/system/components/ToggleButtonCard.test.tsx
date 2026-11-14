import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { ToggleButtonCard } from './ToggleButtonCard'

describe('ToggleButtonCard', () => {
  it('starts with the grid layout selected and the star off', () => {
    renderWithTheme(<ToggleButtonCard />)
    expect(screen.getByText('TOGGLE_BUTTON')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Layout' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Grid layout' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Star' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches the exclusive selection', () => {
    renderWithTheme(<ToggleButtonCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Table layout' }))
    expect(screen.getByRole('button', { name: 'Table layout' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Grid layout' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('keeps the active layout when it is pressed again', () => {
    renderWithTheme(<ToggleButtonCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Grid layout' }))
    expect(screen.getByRole('button', { name: 'Grid layout' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('toggles the standalone star on and off', () => {
    renderWithTheme(<ToggleButtonCard />)
    const star = screen.getByRole('button', { name: 'Star' })
    fireEvent.click(star)
    expect(star).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(star)
    expect(star).toHaveAttribute('aria-pressed', 'false')
  })
})
