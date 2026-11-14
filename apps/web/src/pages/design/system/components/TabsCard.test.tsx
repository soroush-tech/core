import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { TabsCard } from './TabsCard'

describe('TabsCard', () => {
  it('selects the first tab and shows its panel', () => {
    renderWithTheme(<TabsCard />)
    expect(screen.getByText('TABS')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'TOKENS' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Spacing, color, radius')
  })

  it('switches the panel when another tab is chosen', () => {
    renderWithTheme(<TabsCard />)
    fireEvent.click(screen.getByRole('tab', { name: 'COMPONENTS' }))
    expect(screen.getByRole('tab', { name: 'COMPONENTS' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Token-driven primitives')
  })
})
