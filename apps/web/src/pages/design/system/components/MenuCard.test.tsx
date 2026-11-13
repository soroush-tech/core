import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { MenuCard } from './MenuCard'

describe('MenuCard', () => {
  it('renders closed with no command run', () => {
    renderWithTheme(<MenuCard />)
    expect(screen.getByText('MENU')).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByText('LAST_COMMAND: NONE')).toBeInTheDocument()
  })

  it('runs a command chosen from the trigger menu', () => {
    renderWithTheme(<MenuCard />)
    fireEvent.click(screen.getByRole('button', { name: 'OPEN_MENU' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Roll back' }))
    expect(screen.getByText('LAST_COMMAND: ROLLBACK')).toBeInTheDocument()
  })

  it('runs a command chosen from the context menu', () => {
    renderWithTheme(<MenuCard />)
    fireEvent.contextMenu(screen.getByText('RIGHT_CLICK_HERE'), { clientX: 10, clientY: 10 })
    fireEvent.click(screen.getByRole('menuitem', { name: 'Paste' }))
    expect(screen.getByText('LAST_COMMAND: PASTE')).toBeInTheDocument()
  })
})
