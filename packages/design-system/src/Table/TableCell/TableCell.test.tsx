import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '@soroush.tech/design-system/utils/test/renderWithTheme'
import { baseTheme } from '@soroush.tech/design-system/theme'
import { Table } from '../Table'
import { TableHead } from '../TableHead'
import { TableBody } from '../TableBody'
import { TableFooter } from '../TableFooter'
import { TableCell } from './TableCell'

const renderCell = (cell: React.ReactNode) =>
  renderWithTheme(
    <table>
      <tbody>
        <tr>{cell}</tr>
      </tbody>
    </table>
  )

describe('TableCell', () => {
  it('renders a th with scope col inside TableHead', () => {
    renderWithTheme(
      <Table>
        <TableHead>
          <tr>
            <TableCell data-testid="cell">Name</TableCell>
          </tr>
        </TableHead>
      </Table>
    )
    const cell = screen.getByTestId('cell')
    expect(cell.tagName).toBe('TH')
    expect(cell).toHaveAttribute('scope', 'col')
  })

  it('renders a td inside TableBody', () => {
    renderWithTheme(
      <Table>
        <TableBody>
          <tr>
            <TableCell data-testid="cell">Row</TableCell>
          </tr>
        </TableBody>
      </Table>
    )
    const cell = screen.getByTestId('cell')
    expect(cell.tagName).toBe('TD')
    expect(cell).not.toHaveAttribute('scope')
  })

  it('renders a td inside TableFooter', () => {
    renderWithTheme(
      <Table>
        <TableFooter>
          <tr>
            <TableCell data-testid="cell">Total</TableCell>
          </tr>
        </TableFooter>
      </Table>
    )
    expect(screen.getByTestId('cell').tagName).toBe('TD')
  })

  it('defaults to a td outside any section', () => {
    renderCell(<TableCell data-testid="cell" />)
    expect(screen.getByTestId('cell').tagName).toBe('TD')
  })

  it('lets variant override the section context', () => {
    renderWithTheme(
      <Table>
        <TableBody>
          <tr>
            <TableCell variant="head" data-testid="cell" />
          </tr>
        </TableBody>
      </Table>
    )
    const cell = screen.getByTestId('cell')
    expect(cell.tagName).toBe('TH')
    expect(cell).toHaveAttribute('scope', 'col')
  })

  it('lets as override the resolved element', () => {
    renderWithTheme(
      <Table>
        <TableHead>
          <tr>
            <TableCell as="td" data-testid="cell" />
          </tr>
        </TableHead>
      </Table>
    )
    expect(screen.getByTestId('cell').tagName).toBe('TD')
  })

  it('lets scope override the header default', () => {
    renderWithTheme(
      <Table>
        <TableHead>
          <tr>
            <TableCell scope="row" data-testid="cell" />
          </tr>
        </TableHead>
      </Table>
    )
    expect(screen.getByTestId('cell')).toHaveAttribute('scope', 'row')
  })

  it('applies align as text-align', () => {
    renderCell(<TableCell align="right" data-testid="cell" />)
    expect(screen.getByTestId('cell')).toHaveStyle({ textAlign: 'right' })
  })

  it('aligns header and body cells the same by default', () => {
    // text-align: inherit neutralises the browser's default <th> centering.
    // jsdom resolves `inherit` in computed style, so assert the generated rule.
    renderWithTheme(
      <Table>
        <TableHead>
          <tr>
            <TableCell data-testid="head-cell" />
          </tr>
        </TableHead>
        <TableBody>
          <tr>
            <TableCell data-testid="body-cell" />
          </tr>
        </TableBody>
      </Table>
    )
    const allRules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules))
    const hasInheritAlignRule = (element: HTMLElement) =>
      Array.from(element.classList).some((cls) =>
        allRules.some(
          (rule) => rule.cssText.includes(cls) && rule.cssText.includes('text-align: inherit')
        )
      )
    expect(hasInheritAlignRule(screen.getByTestId('head-cell'))).toBe(true)
    expect(hasInheritAlignRule(screen.getByTestId('body-cell'))).toBe(true)
  })

  it('separates rows with a default bottom divider in the table border color', () => {
    renderWithTheme(
      <Table>
        <TableBody>
          <tr>
            <TableCell data-testid="cell" />
          </tr>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId('cell')).toHaveStyle({
      borderBottomWidth: baseTheme.borderWidths.thin,
      borderBottomStyle: 'solid',
      borderBottomColor: baseTheme.border.light,
    })
  })

  it('follows the Table borderColor cascade and lets a cell override it', () => {
    renderWithTheme(
      <Table borderColor="primary">
        <TableBody>
          <tr>
            <TableCell data-testid="cascaded" />
            <TableCell borderColor="dark" data-testid="overridden" />
          </tr>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId('cascaded')).toHaveStyle({
      borderBottomColor: baseTheme.border.primary,
    })
    expect(screen.getByTestId('overridden')).toHaveStyle({
      borderBottomColor: baseTheme.border.dark,
    })
  })

  it('lets explicit border props override the default divider', () => {
    renderCell(<TableCell borderBottom="none" data-testid="cell" />)
    expect(screen.getByTestId('cell')).not.toHaveStyle({ borderBottomStyle: 'solid' })
  })

  it('applies md density padding by default', () => {
    renderCell(<TableCell data-testid="cell" />)
    const { paddingTop, fontSize } = baseTheme.sizes.md
    expect(screen.getByTestId('cell')).toHaveStyle({
      paddingTop: baseTheme.space[paddingTop],
      fontSize: baseTheme.fontSizes[fontSize],
    })
  })

  it('inherits size from the Table context and allows a per-cell override', () => {
    renderWithTheme(
      <Table size="lg">
        <TableBody>
          <tr>
            <TableCell data-testid="inherited" />
            <TableCell size="sm" data-testid="overridden" />
          </tr>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId('inherited')).toHaveStyle({
      paddingTop: baseTheme.space[baseTheme.sizes.lg.paddingTop],
    })
    expect(screen.getByTestId('overridden')).toHaveStyle({
      paddingTop: baseTheme.space[baseTheme.sizes.sm.paddingTop],
    })
  })

  it('zeroes padding when cellPadding is none, inherited or per-cell', () => {
    renderWithTheme(
      <Table cellPadding="none">
        <TableBody>
          <tr>
            <TableCell data-testid="inherited" />
          </tr>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId('inherited')).toHaveStyle({ padding: '0' })

    renderCell(<TableCell cellPadding="none" data-testid="cell" />)
    expect(screen.getByTestId('cell')).toHaveStyle({ padding: '0' })
  })

  it('makes header cells sticky with an opaque default background', () => {
    renderWithTheme(
      <Table hasStickyHeader>
        <TableHead>
          <tr>
            <TableCell data-testid="head-cell" />
          </tr>
        </TableHead>
        <TableBody>
          <tr>
            <TableCell data-testid="body-cell" />
          </tr>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId('head-cell')).toHaveStyle({
      position: 'sticky',
      top: '0',
      backgroundColor: baseTheme.background.paper,
    })
    expect(screen.getByTestId('body-cell')).not.toHaveStyle({ position: 'sticky' })
  })

  it('lets an explicit bg override the sticky default background', () => {
    renderWithTheme(
      <Table hasStickyHeader>
        <TableHead>
          <tr>
            <TableCell bg="secondary" data-testid="head-cell" />
          </tr>
        </TableHead>
      </Table>
    )
    expect(screen.getByTestId('head-cell')).toHaveStyle({
      position: 'sticky',
      backgroundColor: baseTheme.background.secondary,
    })
  })

  it('truncates overflowing text with an ellipsis when hasEllipsis is set', () => {
    renderCell(<TableCell hasEllipsis maxWidth="80px" data-testid="cell" />)
    expect(screen.getByTestId('cell')).toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    })
  })

  it('inherits hasEllipsis from the Table and lets a cell opt out', () => {
    renderWithTheme(
      <Table hasEllipsis>
        <TableBody>
          <tr>
            <TableCell data-testid="inherited" />
            <TableCell hasEllipsis={false} data-testid="overridden" />
          </tr>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId('inherited')).toHaveStyle({ textOverflow: 'ellipsis' })
    expect(screen.getByTestId('overridden')).not.toHaveStyle({ textOverflow: 'ellipsis' })
  })

  it('sets aria-sort from sortDirection', () => {
    renderWithTheme(
      <Table>
        <TableHead>
          <tr>
            <TableCell sortDirection="asc" data-testid="asc" />
            <TableCell sortDirection="desc" data-testid="desc" />
            <TableCell data-testid="none" />
          </tr>
        </TableHead>
      </Table>
    )
    expect(screen.getByTestId('asc')).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByTestId('desc')).toHaveAttribute('aria-sort', 'descending')
    expect(screen.getByTestId('none')).not.toHaveAttribute('aria-sort')
  })

  it('applies bg, color, and typography theme tokens', () => {
    renderCell(
      <TableCell
        bg="paper"
        color="secondary"
        borderColor="light"
        fontWeight="bold"
        data-testid="cell"
      />
    )
    expect(screen.getByTestId('cell')).toHaveStyle({
      borderColor: baseTheme.border.light,
      backgroundColor: baseTheme.background.paper,
      color: baseTheme.text.secondary,
    })
  })

  it('forwards HTML attributes without leaking custom props to the DOM', () => {
    renderCell(<TableCell colSpan={3} align="center" cellPadding="none" data-testid="cell" />)
    const cell = screen.getByTestId('cell')
    expect(cell).toHaveAttribute('colspan', '3')
    expect(cell).not.toHaveAttribute('align')
    expect(cell).not.toHaveAttribute('cellPadding')
    expect(cell).not.toHaveAttribute('variant')
  })
})
