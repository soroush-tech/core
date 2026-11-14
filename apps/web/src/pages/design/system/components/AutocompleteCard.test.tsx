import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { AutocompleteCard } from './AutocompleteCard'

describe('AutocompleteCard', () => {
  it('renders the title, both fields and the default chips', () => {
    renderWithTheme(<AutocompleteCard />)
    expect(screen.getByText('AUTOCOMPLETE')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Region' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Stack' })).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('REGION: NONE')).toBeInTheDocument()
  })

  it('filters the regions and chooses one', () => {
    renderWithTheme(<AutocompleteCard />)
    const field = screen.getByRole('combobox', { name: 'Region' })
    fireEvent.change(field, { target: { value: 'sin' } })
    fireEvent.click(screen.getByRole('option', { name: 'sin1' }))
    expect(screen.getByText('REGION: sin1')).toBeInTheDocument()
  })

  it('removes a chip from the multiple field', () => {
    renderWithTheme(<AutocompleteCard />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Vite' }))
    expect(screen.queryByText('Vite')).not.toBeInTheDocument()
  })
})
