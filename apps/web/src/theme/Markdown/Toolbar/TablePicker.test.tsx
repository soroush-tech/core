import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { TablePicker } from './TablePicker'

describe('TablePicker', () => {
  it('opens the size grid and moves focus into it', () => {
    renderWithTheme(<TablePicker onSelect={vi.fn()} />)
    expect(screen.queryByRole('grid')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    expect(screen.getByRole('grid', { name: 'Table size' })).toBeInTheDocument()
    // The popover is portalled, so auto-focus must pull keyboard users into the grid.
    expect(screen.getByRole('gridcell', { name: '1 by 1' })).toHaveFocus()
    expect(screen.getByText('1 × 1')).toBeInTheDocument()
  })

  it('grows the grid when the hover reaches the current edge', () => {
    renderWithTheme(<TablePicker onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    expect(screen.queryByRole('gridcell', { name: '9 by 9' })).toBeNull()
    fireEvent.mouseEnter(screen.getByRole('gridcell', { name: '8 by 8' }))
    expect(screen.getByRole('gridcell', { name: '9 by 9' })).toBeInTheDocument()
  })

  it('does not shrink the grid when the hover moves back inward', () => {
    renderWithTheme(<TablePicker onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.mouseEnter(screen.getByRole('gridcell', { name: '8 by 8' }))
    expect(screen.getByRole('gridcell', { name: '9 by 9' })).toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByRole('gridcell', { name: '1 by 1' }))
    expect(screen.getByRole('gridcell', { name: '9 by 9' })).toBeInTheDocument()
  })

  it('resets to the default size when reopened', () => {
    renderWithTheme(<TablePicker onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.mouseEnter(screen.getByRole('gridcell', { name: '8 by 8' }))
    fireEvent.click(screen.getByRole('gridcell', { name: '2 by 2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    expect(screen.queryByRole('gridcell', { name: '9 by 9' })).toBeNull()
  })

  it('reflects the hovered size in the caption', () => {
    renderWithTheme(<TablePicker onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.mouseEnter(screen.getByRole('gridcell', { name: '3 by 4' }))
    expect(screen.getByText('3 × 4')).toBeInTheDocument()
  })

  it('updates the size on keyboard focus as well', () => {
    renderWithTheme(<TablePicker onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.focus(screen.getByRole('gridcell', { name: '2 by 2' }))
    expect(screen.getByText('2 × 2')).toBeInTheDocument()
  })

  it('reports the picked size and closes the grid', () => {
    const onSelect = vi.fn()
    renderWithTheme(<TablePicker onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(screen.getByRole('gridcell', { name: '2 by 3' }))
    expect(onSelect).toHaveBeenCalledWith(2, 3)
    expect(screen.queryByRole('grid')).toBeNull()
  })
})
