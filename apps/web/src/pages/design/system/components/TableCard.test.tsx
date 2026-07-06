import { screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { TableCard } from './TableCard'
import { SERVICES } from './TableCard.data'

const getBodyRows = () => {
  const rowgroups = screen.getAllByRole('rowgroup')
  // thead / tbody / tfoot — tbody is the second rowgroup
  return within(rowgroups[1]).getAllByRole('row')
}

describe('TableCard', () => {
  it('renders the card title', () => {
    renderWithTheme(<TableCard />)
    expect(screen.getByText('TABLE')).toBeInTheDocument()
  })

  it('renders header cells as column headers', () => {
    renderWithTheme(<TableCard />)
    expect(screen.getByRole('columnheader', { name: /Service/ })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Region' })).toBeInTheDocument()
  })

  it('shows the first page in data order before any sorting', () => {
    renderWithTheme(<TableCard />)
    const rows = getBodyRows()
    expect(rows).toHaveLength(5)
    expect(within(rows[0]).getByText('web')).toBeInTheDocument()
  })

  it('sorts descending on the first click and flips on the second', () => {
    renderWithTheme(<TableCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Service' }))
    expect(within(getBodyRows()[0]).getByText('worker')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Service' }))
    expect(within(getBodyRows()[0]).getByText('api')).toBeInTheDocument()
  })

  it('sorts by latency when its header control is clicked', () => {
    renderWithTheme(<TableCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Latency (ms)' }))
    // first click sorts descending — highest latency first
    expect(within(getBodyRows()[0]).getByText('worker')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Latency (ms)' }))
    expect(within(getBodyRows()[0]).getByText('cdn')).toBeInTheDocument()
  })

  it('pages through the data', () => {
    renderWithTheme(<TableCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))
    expect(screen.getByText(`6–10 of ${SERVICES.length}`)).toBeInTheDocument()
  })

  it('changes rows per page and resets to the first page', () => {
    renderWithTheme(<TableCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Rows per page' }), {
      target: { value: '10' },
    })
    expect(getBodyRows()).toHaveLength(10)
    expect(screen.getByText(`1–10 of ${SERVICES.length}`)).toBeInTheDocument()
  })
})
