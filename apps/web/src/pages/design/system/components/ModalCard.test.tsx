import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { ModalCard } from './ModalCard'

describe('ModalCard', () => {
  it('renders the card title with the modal closed', () => {
    renderWithTheme(<ModalCard />)
    expect(screen.getByText('MODAL')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the dialog from the trigger', () => {
    renderWithTheme(<ModalCard />)
    fireEvent.click(screen.getByRole('button', { name: 'OPEN_MODAL' }))
    expect(screen.getByRole('dialog', { name: 'Modal demo' })).toBeInTheDocument()
    expect(screen.getByText('MODAL_DIALOG')).toBeInTheDocument()
  })

  it('closes via the CLOSE button', () => {
    renderWithTheme(<ModalCard />)
    fireEvent.click(screen.getByRole('button', { name: 'OPEN_MODAL' }))
    fireEvent.click(screen.getByRole('button', { name: 'CLOSE' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on Escape via onClose', () => {
    renderWithTheme(<ModalCard />)
    fireEvent.click(screen.getByRole('button', { name: 'OPEN_MODAL' }))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
