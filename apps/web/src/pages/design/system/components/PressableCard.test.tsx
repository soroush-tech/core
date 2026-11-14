import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { PressableCard } from './PressableCard'

describe('PressableCard', () => {
  it('renders the title, three surfaces and a zero count', () => {
    renderWithTheme(<PressableCard />)
    expect(screen.getByText('PRESSABLE')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /_ROW$/ })).toHaveLength(3)
    expect(screen.getByText('PRESSES: 0')).toBeInTheDocument()
  })

  it('counts clicks on the enabled surfaces', () => {
    renderWithTheme(<PressableCard />)
    fireEvent.click(screen.getByRole('button', { name: 'HIGHLIGHT_ROW' }))
    fireEvent.click(screen.getByRole('button', { name: 'OPACITY_ROW' }))
    expect(screen.getByText('PRESSES: 2')).toBeInTheDocument()
  })

  it('ignores the disabled surface', () => {
    renderWithTheme(<PressableCard />)
    fireEvent.click(screen.getByRole('button', { name: 'DISABLED_ROW' }))
    expect(screen.getByText('PRESSES: 0')).toBeInTheDocument()
  })
})
