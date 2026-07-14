import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders a navigation landmark with the default label', () => {
    renderWithTheme(<Pagination count={5} />)
    expect(screen.getByRole('navigation', { name: 'pagination navigation' })).toBeInTheDocument()
  })

  it('allows overriding the landmark label', () => {
    renderWithTheme(<Pagination count={5} aria-label="search results pages" />)
    expect(screen.getByRole('navigation', { name: 'search results pages' })).toBeInTheDocument()
  })

  it('renders page buttons with accessible names and the current page marked', () => {
    renderWithTheme(<Pagination count={5} defaultPage={2} />)
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument()
    const current = screen.getByRole('button', { name: 'page 2' })
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('renders prev/next controls and supports first/last flags', () => {
    renderWithTheme(<Pagination count={5} shouldShowFirstButton shouldShowLastButton />)
    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeInTheDocument()
  })

  it('hides prev/next controls via the shouldHide flags', () => {
    renderWithTheme(<Pagination count={5} shouldHidePrevButton shouldHideNextButton />)
    expect(screen.queryByRole('button', { name: 'Go to previous page' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Go to next page' })).not.toBeInTheDocument()
  })

  it('renders ellipses as hidden non-interactive items', () => {
    const { container } = renderWithTheme(<Pagination count={11} defaultPage={6} />)
    const hiddenItems = container.querySelectorAll('li[aria-hidden="true"]')
    expect(hiddenItems).toHaveLength(2)
    expect(hiddenItems[0]).toHaveTextContent('…')
  })

  it('pages uncontrolled and fires onChange with the 1-based page', () => {
    const onChange = vi.fn()
    renderWithTheme(<Pagination count={5} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }))
    expect(onChange).toHaveBeenCalledWith(3)
    expect(screen.getByRole('button', { name: 'page 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('leaves paging to the consumer when controlled', () => {
    const onChange = vi.fn()
    renderWithTheme(<Pagination count={5} page={1} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))
    expect(onChange).toHaveBeenCalledWith(2)
    expect(screen.getByRole('button', { name: 'page 1' })).toHaveAttribute('aria-current', 'page')
  })

  it('disables every item when disabled', () => {
    renderWithTheme(<Pagination count={3} disabled />)
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
  })

  it('supports a custom getItemAriaLabel', () => {
    renderWithTheme(
      <Pagination
        count={3}
        getItemAriaLabel={(type, page) => (type === 'page' ? `Seite ${page}` : `Zur ${type}`)}
      />
    )
    expect(screen.getByRole('button', { name: 'Seite 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zur next' })).toBeInTheDocument()
  })

  it('passes color, variant, shape, and size down to items', () => {
    renderWithTheme(
      <Pagination count={3} defaultPage={1} color="secondary" shape="rounded" size="lg" />
    )
    const current = screen.getByRole('button', { name: 'page 1' })
    expect(current).toHaveStyle({ minWidth: '2.5rem' })
  })
})
