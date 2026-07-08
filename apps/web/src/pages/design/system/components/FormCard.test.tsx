import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { FormCard } from './FormCard'

describe('FormCard', () => {
  it('renders the card title, labels, and helper texts', () => {
    renderWithTheme(<FormCard />)
    expect(screen.getByText('FORM')).toBeInTheDocument()
    expect(screen.getByLabelText(/CALLSIGN/)).toBeInTheDocument()
    expect(screen.getByText('Visible on the public roster.')).toBeInTheDocument()
    expect(screen.getByText('ACCESS_CODE')).toBeInTheDocument()
    expect(screen.getByText('ERR_INVALID_CODE — request a new code.')).toBeInTheDocument()
  })

  it('renders the channel select inside the form context', () => {
    renderWithTheme(<FormCard />)
    expect(screen.getByText('CHANNEL')).toBeInTheDocument()
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: 'Bravo' }))
    expect(trigger).toHaveTextContent('Bravo')
  })

  it('accepts input in the TanStack-bound field', () => {
    renderWithTheme(<FormCard />)
    const input = screen.getByPlaceholderText('e.g. NIGHTHAWK')
    fireEvent.change(input, { target: { value: 'NIGHTHAWK' } })
    expect(input).toHaveValue('NIGHTHAWK')
  })

  it('submits through the form handler without navigating', () => {
    renderWithTheme(<FormCard />)
    fireEvent.submit(screen.getByTestId('form-demo'))
    expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeInTheDocument()
  })
})
