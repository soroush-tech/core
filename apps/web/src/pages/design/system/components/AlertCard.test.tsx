import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { AlertCard } from './AlertCard'

describe('AlertCard', () => {
  it('renders one polite alert per severity', () => {
    renderWithTheme(<AlertCard />)
    expect(screen.getByText('ALERT')).toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(4)
  })

  it('leads the success alert with its title', () => {
    renderWithTheme(<AlertCard />)
    expect(screen.getByText('DEPLOYED')).toBeInTheDocument()
    expect(screen.getByText('The worker failed its health check.')).toBeInTheDocument()
  })
})
