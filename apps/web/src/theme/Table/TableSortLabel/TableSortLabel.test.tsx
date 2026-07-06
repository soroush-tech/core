import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Table } from 'src/theme/Table/Table'
import { TableHead } from 'src/theme/Table/TableHead'
import { TableCell } from 'src/theme/Table/TableCell'
import { TableSortLabel } from './TableSortLabel'

const getRevealRule = (button: HTMLElement) => {
  const buttonClasses = Array.from(button.classList)
  const allRules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules))
  return allRules.find(
    (rule) =>
      buttonClasses.some((cls) => rule.cssText.includes(cls)) &&
      rule.cssText.includes(':hover .sort-icon') &&
      rule.cssText.includes('opacity')
  )
}

describe('TableSortLabel', () => {
  it('renders a button with the label and an appended sort icon', () => {
    const { container } = renderWithTheme(<TableSortLabel>Name</TableSortLabel>)
    const button = screen.getByRole('button', { name: 'Name' })
    expect(button).toHaveAttribute('type', 'button')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('points the arrow up for asc and rotates it for desc', () => {
    const { container: asc } = renderWithTheme(<TableSortLabel direction="asc">A</TableSortLabel>)
    expect(asc.querySelector('svg')).toHaveStyle({ transform: 'none' })

    const { container: desc } = renderWithTheme(<TableSortLabel direction="desc">D</TableSortLabel>)
    expect(desc.querySelector('svg')).toHaveStyle({ transform: 'rotate(180deg)' })
  })

  it('shows the icon fully opaque when active', () => {
    const { container } = renderWithTheme(<TableSortLabel isActive>Name</TableSortLabel>)
    expect(container.querySelector('svg')).toHaveStyle({ opacity: '1' })
  })

  it('hides the icon while inactive', () => {
    const { container } = renderWithTheme(<TableSortLabel>Name</TableSortLabel>)
    expect(container.querySelector('svg')).toHaveStyle({ opacity: '0' })
  })

  it('keeps the inherited cell color when active', () => {
    renderWithTheme(
      <div>
        <TableSortLabel isActive data-testid="active">
          Active
        </TableSortLabel>
        <TableSortLabel data-testid="inactive">Inactive</TableSortLabel>
      </div>
    )
    const active = screen.getByTestId('active')
    const inactive = screen.getByTestId('inactive')
    expect(getComputedStyle(active).color).toBe(getComputedStyle(inactive).color)
  })

  it('hides the inactive icon by default and reveals it on hover/focus', () => {
    const { container } = renderWithTheme(<TableSortLabel>Name</TableSortLabel>)
    expect(container.querySelector('svg')).toHaveStyle({ opacity: '0' })
    const rule = getRevealRule(screen.getByRole('button'))
    expect(rule).toBeDefined()
    expect(rule?.cssText).toContain('opacity: 0.5')
  })

  it('keeps the inactive icon always visible (dimmed) when shouldHideSortIcon is false', () => {
    const { container } = renderWithTheme(
      <TableSortLabel shouldHideSortIcon={false}>Name</TableSortLabel>
    )
    expect(container.querySelector('svg')).toHaveStyle({ opacity: '0.5' })
    expect(getRevealRule(screen.getByRole('button'))).toBeUndefined()
  })

  it('does not add a reveal rule when active, so the icon stays fully opaque', () => {
    renderWithTheme(<TableSortLabel isActive>Name</TableSortLabel>)
    expect(getRevealRule(screen.getByRole('button'))).toBeUndefined()
  })

  it('inherits shouldHideSortIcon from the enclosing Table via context', () => {
    const { container } = renderWithTheme(
      <Table shouldHideSortIcon={false}>
        <TableHead>
          <tr>
            <TableCell>
              <TableSortLabel>Name</TableSortLabel>
            </TableCell>
          </tr>
        </TableHead>
      </Table>
    )
    expect(container.querySelector('svg')).toHaveStyle({ opacity: '0.5' })
  })

  it('lets the explicit prop override the Table context', () => {
    const { container } = renderWithTheme(
      <Table shouldHideSortIcon={false}>
        <TableHead>
          <tr>
            <TableCell>
              <TableSortLabel shouldHideSortIcon>Name</TableSortLabel>
            </TableCell>
          </tr>
        </TableHead>
      </Table>
    )
    expect(container.querySelector('svg')).toHaveStyle({ opacity: '0' })
    expect(getRevealRule(screen.getByRole('button'))).toBeDefined()
  })

  it('keeps the icon visible when active even with shouldHideSortIcon', () => {
    const { container } = renderWithTheme(
      <TableSortLabel isActive shouldHideSortIcon>
        Name
      </TableSortLabel>
    )
    expect(container.querySelector('svg')).toHaveStyle({ opacity: '1' })
  })

  it('forwards onClick so the consumer can drive sorting', () => {
    const onClick = vi.fn()
    renderWithTheme(<TableSortLabel onClick={onClick}>Name</TableSortLabel>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('supports overriding the icon and its props', () => {
    const { container } = renderWithTheme(
      <TableSortLabel iconName="expand_more" iconProps={{ size: '2rem' }}>
        Name
      </TableSortLabel>
    )
    expect(container.querySelector('svg')).toHaveStyle({ width: '2rem' })
  })

  it('forwards HTML attributes without leaking custom props to the DOM', () => {
    renderWithTheme(
      <TableSortLabel isActive shouldHideSortIcon aria-label="Sort by name" data-testid="label">
        Name
      </TableSortLabel>
    )
    const button = screen.getByTestId('label')
    expect(button).toHaveAttribute('aria-label', 'Sort by name')
    expect(button).not.toHaveAttribute('isActive')
    expect(button).not.toHaveAttribute('shouldHideSortIcon')
  })
})
