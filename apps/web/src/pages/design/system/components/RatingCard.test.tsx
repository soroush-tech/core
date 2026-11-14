import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { RatingCard } from './RatingCard'

describe('RatingCard', () => {
  it('renders the title, the interactive group and the read-only image', () => {
    renderWithTheme(<RatingCard />)
    expect(screen.getByText('RATING')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Quality' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '3.5 of 5' })).toBeInTheDocument()
    expect(screen.getByText('VALUE: 4 of 5')).toBeInTheDocument()
  })

  it('changes the rating when an item is chosen', () => {
    renderWithTheme(<RatingCard />)
    fireEvent.click(screen.getByRole('radio', { name: '2 of 5' }))
    expect(screen.getByText('VALUE: 2 of 5')).toBeInTheDocument()
  })

  it('shows NONE when the rating is cleared', () => {
    renderWithTheme(<RatingCard />)
    fireEvent.click(screen.getByRole('radio', { name: 'No rating' }))
    expect(screen.getByText('VALUE: NONE')).toBeInTheDocument()
  })
})
