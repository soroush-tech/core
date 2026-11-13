import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { TransferListCard } from './TransferListCard'

describe('TransferListCard', () => {
  it('renders the title, both lists and the cached readout', () => {
    renderWithTheme(<TransferListCard />)
    expect(screen.getByText('TRANSFER_LIST')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'ROUTES' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'CACHED' })).toBeInTheDocument()
    expect(screen.getByText('CACHED: home')).toBeInTheDocument()
  })

  it('moves a checked route to the cached list', () => {
    renderWithTheme(<TransferListCard />)
    fireEvent.click(screen.getByRole('checkbox', { name: '/articles' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cache the checked routes' }))
    expect(screen.getByText('CACHED: home, articles')).toBeInTheDocument()
  })

  it('shows NONE once every route is uncached', () => {
    renderWithTheme(<TransferListCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Uncache every route' }))
    expect(screen.getByText('CACHED: NONE')).toBeInTheDocument()
  })
})
