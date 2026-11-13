import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { RangeInputCard } from './RangeInputCard'

describe('RangeInputCard', () => {
  it('renders the title, the single thumb and the named range thumbs', () => {
    renderWithTheme(<RangeInputCard />)
    expect(screen.getByText('RANGE_INPUT')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Lowest latency' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Highest latency' })).toBeInTheDocument()
    expect(screen.getByText('VOLUME: 30')).toBeInTheDocument()
    expect(screen.getByText('LATENCY_MS: 20 - 70')).toBeInTheDocument()
  })

  it('updates the volume readout as the thumb moves', () => {
    renderWithTheme(<RangeInputCard />)
    fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), { target: { value: '45' } })
    expect(screen.getByText('VOLUME: 45')).toBeInTheDocument()
  })

  it('updates the range readout as a thumb moves', () => {
    renderWithTheme(<RangeInputCard />)
    fireEvent.change(screen.getByRole('slider', { name: 'Highest latency' }), {
      target: { value: '90' },
    })
    expect(screen.getByText('LATENCY_MS: 20 - 90')).toBeInTheDocument()
  })
})
