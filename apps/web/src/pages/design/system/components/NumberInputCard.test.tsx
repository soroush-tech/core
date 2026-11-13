import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { NumberInputCard } from './NumberInputCard'

describe('NumberInputCard', () => {
  it('renders the title and both fields with their values', () => {
    renderWithTheme(<NumberInputCard />)
    expect(screen.getByText('NUMBER_INPUT')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Replicas' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Load' })).toBeInTheDocument()
    expect(screen.getByText('REPLICAS: 3')).toBeInTheDocument()
    expect(screen.getByText('RAW_VALUE: 0.5')).toBeInTheDocument()
  })

  it('steps the replicas with the arrow keys', () => {
    renderWithTheme(<NumberInputCard />)
    fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Replicas' }), { key: 'ArrowUp' })
    expect(screen.getByText('REPLICAS: 4')).toBeInTheDocument()
  })

  it('steps the load with the arrow keys', () => {
    renderWithTheme(<NumberInputCard />)
    fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Load' }), { key: 'ArrowDown' })
    expect(screen.getByText('RAW_VALUE: 0.4')).toBeInTheDocument()
  })

  it('shows NONE when either field is cleared', () => {
    renderWithTheme(<NumberInputCard />)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Replicas' }), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Load' }), { target: { value: '' } })
    expect(screen.getByText('REPLICAS: NONE')).toBeInTheDocument()
    expect(screen.getByText('RAW_VALUE: NONE')).toBeInTheDocument()
  })
})
