import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { PaginationCard } from './PaginationCard'

describe('PaginationCard', () => {
  it('renders the card title and both pagination variants', () => {
    renderWithTheme(<PaginationCard />)
    expect(screen.getByText('PAGINATION')).toBeInTheDocument()
    expect(screen.getByText('TEXT_CIRCULAR')).toBeInTheDocument()
    expect(screen.getByText('OUTLINED_ROUNDED')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation')).toHaveLength(2)
  })

  it('starts on page 1', () => {
    renderWithTheme(<PaginationCard />)
    expect(screen.getByText('PAGE_1/12')).toBeInTheDocument()
  })

  it('updates the shared page state from either instance', () => {
    renderWithTheme(<PaginationCard />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Go to page 3' })[0])
    expect(screen.getByText('PAGE_3/12')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Go to next page' })[1])
    expect(screen.getByText('PAGE_4/12')).toBeInTheDocument()
  })
})
