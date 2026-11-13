import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { BadgeCard } from './BadgeCard'

describe('BadgeCard', () => {
  it('renders the card title and every demo label', () => {
    renderWithTheme(<BadgeCard />)
    expect(screen.getByText('BADGE')).toBeInTheDocument()
    for (const label of ['COUNT', 'MAX', 'ZERO', 'DOT']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('caps a count past max and still shows a zero count', () => {
    renderWithTheme(<BadgeCard />)
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('99+')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('gives each badge an accessible label', () => {
    renderWithTheme(<BadgeCard />)
    expect(screen.getByText('120 new events')).toBeInTheDocument()
    expect(screen.getByText('Sync pending')).toBeInTheDocument()
  })
})
