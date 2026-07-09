import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { AppBarCard } from './AppBarCard'

describe('AppBarCard', () => {
  it('renders the card title', () => {
    renderWithTheme(<AppBarCard />)
    expect(screen.getByText('APP_BAR')).toBeInTheDocument()
  })

  it('renders one app bar per size', () => {
    renderWithTheme(<AppBarCard />)
    expect(screen.getByText('SIZE_SM')).toBeInTheDocument()
    expect(screen.getByText('SIZE_MD')).toBeInTheDocument()
    expect(screen.getByText('SIZE_LG')).toBeInTheDocument()
    expect(screen.getAllByRole('banner')).toHaveLength(3)
  })
})
