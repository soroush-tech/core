import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { ZoomCard } from './ZoomCard'

describe('ZoomCard', () => {
  it('renders the card title with the target shown', () => {
    renderWithTheme(<ZoomCard />)
    expect(screen.getByText('ZOOM')).toBeInTheDocument()
    expect(screen.getByText('ZOOM_TARGET')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'HIDE' })).toBeInTheDocument()
  })

  it('toggles the target out and back in', () => {
    renderWithTheme(<ZoomCard />)
    fireEvent.click(screen.getByRole('button', { name: 'HIDE' }))
    expect(screen.getByRole('button', { name: 'SHOW' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'SHOW' }))
    expect(screen.getByRole('button', { name: 'HIDE' })).toBeInTheDocument()
    expect(screen.getByText('ZOOM_TARGET')).toBeInTheDocument()
  })
})
