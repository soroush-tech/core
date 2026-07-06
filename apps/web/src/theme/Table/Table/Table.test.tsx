import { useContext } from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { dark } from 'src/theme/themes'
import { TableContext } from 'src/theme/Table/TableContext'
import { Table } from './Table'

/** Exposes the TableContext the Table provides to descendants. */
function ContextProbe() {
  const { size, cellPadding, hasStickyHeader } = useContext(TableContext)
  return (
    <tbody>
      <tr>
        <td
          data-testid="probe"
          data-size={size}
          data-cell-padding={cellPadding}
          data-sticky={String(hasStickyHeader)}
        />
      </tr>
    </tbody>
  )
}

describe('Table', () => {
  it('renders a table element with collapsed borders and full width', () => {
    renderWithTheme(<Table data-testid="table" />)
    const table = screen.getByTestId('table')
    expect(table.tagName).toBe('TABLE')
    expect(table).toHaveStyle({ borderCollapse: 'collapse', width: '100%' })
  })

  it('frames the table with a thin solid border by default', () => {
    renderWithTheme(<Table data-testid="table" />)
    expect(screen.getByTestId('table')).toHaveStyle({
      borderWidth: dark.borderWidths.thin,
      borderStyle: 'solid',
      borderColor: dark.border.light,
    })
  })

  it('lets explicit border props override the default frame', () => {
    renderWithTheme(<Table borderColor="primary" borderWidth="thick" data-testid="table" />)
    expect(screen.getByTestId('table')).toHaveStyle({
      borderWidth: dark.borderWidths.thick,
      borderColor: dark.border.primary,
      borderStyle: 'solid',
    })
  })

  it('overrides the root element via as', () => {
    renderWithTheme(<Table as="div" data-testid="table" />)
    expect(screen.getByTestId('table').tagName).toBe('DIV')
  })

  it('provides default size, cellPadding, and hasStickyHeader via TableContext', () => {
    renderWithTheme(
      <Table>
        <ContextProbe />
      </Table>
    )
    const probe = screen.getByTestId('probe')
    expect(probe).toHaveAttribute('data-size', 'md')
    expect(probe).toHaveAttribute('data-cell-padding', 'normal')
    expect(probe).toHaveAttribute('data-sticky', 'false')
  })

  it('broadcasts explicit size, cellPadding, and hasStickyHeader via TableContext', () => {
    renderWithTheme(
      <Table size="sm" cellPadding="none" hasStickyHeader>
        <ContextProbe />
      </Table>
    )
    const probe = screen.getByTestId('probe')
    expect(probe).toHaveAttribute('data-size', 'sm')
    expect(probe).toHaveAttribute('data-cell-padding', 'none')
    expect(probe).toHaveAttribute('data-sticky', 'true')
  })

  it('applies bg and color theme tokens', () => {
    renderWithTheme(<Table bg="paper" color="secondary" data-testid="table" />)
    expect(screen.getByTestId('table')).toHaveStyle({
      backgroundColor: dark.background.paper,
      color: dark.text.secondary,
    })
  })

  it('applies space props', () => {
    renderWithTheme(<Table m={2} data-testid="table" />)
    expect(screen.getByTestId('table')).toHaveStyle({ margin: dark.space[2] })
  })

  it('switches to the separate border model so borderRadius renders', () => {
    renderWithTheme(
      <Table borderRadius="md" borderWidth="thin" borderStyle="solid" data-testid="table" />
    )
    expect(screen.getByTestId('table')).toHaveStyle({
      borderCollapse: 'separate',
      borderSpacing: '0',
      overflow: 'hidden',
      borderRadius: dark.radii.md,
    })
  })

  it('sets table-wide text alignment via align', () => {
    renderWithTheme(<Table align="center" data-testid="table" />)
    expect(screen.getByTestId('table')).toHaveStyle({ textAlign: 'center' })
  })

  it('leaves text alignment untouched when align is omitted', () => {
    renderWithTheme(<Table data-testid="table" />)
    expect(screen.getByTestId('table')).not.toHaveStyle({ textAlign: 'center' })
  })

  it('forwards HTML attributes without leaking custom props to the DOM', () => {
    renderWithTheme(<Table aria-label="Users" size="lg" data-testid="table" />)
    const table = screen.getByTestId('table')
    expect(table).toHaveAttribute('aria-label', 'Users')
    expect(table).not.toHaveAttribute('size')
    expect(table).not.toHaveAttribute('cellPadding')
  })
})
