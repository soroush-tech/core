import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '../../utils/test/renderWithTheme'
import { TablePaginationActions } from './TablePaginationActions'

const label = (type: string) => `Go to ${type} page`

const defaultProps = {
  count: 100,
  page: 2,
  rowsPerPage: 10,
  onPageChange: () => {},
  getItemAriaLabel: label,
}

describe('TablePaginationActions', () => {
  it('renders previous and next buttons by default', () => {
    renderWithTheme(<TablePaginationActions {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Go to first page' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Go to last page' })).not.toBeInTheDocument()
  })

  it('adds first and last buttons via the flags', () => {
    renderWithTheme(
      <TablePaginationActions {...defaultProps} shouldShowFirstButton shouldShowLastButton />
    )
    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeInTheDocument()
  })

  it('fires onPageChange with the correct target for each button', () => {
    const onPageChange = vi.fn()
    renderWithTheme(
      <TablePaginationActions
        {...defaultProps}
        onPageChange={onPageChange}
        shouldShowFirstButton
        shouldShowLastButton
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Go to first page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(0)
    fireEvent.click(screen.getByRole('button', { name: 'Go to previous page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(1)
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
    fireEvent.click(screen.getByRole('button', { name: 'Go to last page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(9)
  })

  it('disables backward buttons on the first page', () => {
    renderWithTheme(
      <TablePaginationActions
        {...defaultProps}
        page={0}
        shouldShowFirstButton
        shouldShowLastButton
      />
    )
    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to next page' })).not.toBeDisabled()
  })

  it('disables forward buttons on the last page', () => {
    renderWithTheme(
      <TablePaginationActions
        {...defaultProps}
        page={9}
        shouldShowFirstButton
        shouldShowLastButton
      />
    )
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to previous page' })).not.toBeDisabled()
  })

  it('keeps next enabled and last disabled for an unknown count', () => {
    renderWithTheme(
      <TablePaginationActions
        {...defaultProps}
        count={-1}
        page={50}
        shouldShowFirstButton
        shouldShowLastButton
      />
    )
    expect(screen.getByRole('button', { name: 'Go to next page' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeDisabled()
  })

  it('treats rowsPerPage -1 as a single page holding all rows', () => {
    renderWithTheme(
      <TablePaginationActions {...defaultProps} page={0} rowsPerPage={-1} shouldShowLastButton />
    )
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeDisabled()
  })

  it('disables every button when disabled', () => {
    renderWithTheme(
      <TablePaginationActions
        {...defaultProps}
        disabled
        shouldShowFirstButton
        shouldShowLastButton
      />
    )
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
  })

  it('forwards HTML attributes to the root', () => {
    renderWithTheme(<TablePaginationActions {...defaultProps} data-testid="actions" />)
    expect(screen.getByTestId('actions')).toBeInTheDocument()
  })
})
