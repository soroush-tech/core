import { fireEvent, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { SelectCard } from './SelectCard'

describe('SelectCard', () => {
  it('renders the card title and both demos', () => {
    renderWithTheme(<SelectCard />)
    expect(screen.getByText('SELECT')).toBeInTheDocument()
    expect(screen.getByText('CUSTOM_LISTBOX')).toBeInTheDocument()
    expect(screen.getByText('NATIVE_SELECT')).toBeInTheDocument()
  })

  it('opens the custom listbox and selects an option', () => {
    renderWithTheme(<SelectCard />)
    const trigger = screen.getByRole('combobox', { name: 'custom platform select' })
    fireEvent.click(trigger)
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Android' }))
    expect(trigger).toHaveTextContent('Android')
  })

  it('changes the native select value', () => {
    renderWithTheme(<SelectCard />)
    const nativeSelect = screen.getByRole('combobox', { name: 'native platform select' })
    fireEvent.change(nativeSelect, { target: { value: 'ios' } })
    expect(nativeSelect).toHaveValue('ios')
  })
})
