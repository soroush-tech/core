import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { dark } from 'src/theme/themes'
import { TableRow } from './TableRow'

const renderRow = (row: React.ReactNode) =>
  renderWithTheme(
    <table>
      <tbody>{row}</tbody>
    </table>
  )

describe('TableRow', () => {
  it('renders a tr element', () => {
    renderRow(<TableRow data-testid="row" />)
    expect(screen.getByTestId('row').tagName).toBe('TR')
  })

  it('overrides the root element via as', () => {
    renderWithTheme(<TableRow as="div" data-testid="row" />)
    expect(screen.getByTestId('row').tagName).toBe('DIV')
  })

  it('applies the selected shading from the primary palette by default', () => {
    renderRow(<TableRow isSelected data-testid="row" />)
    expect(screen.getByTestId('row')).toHaveStyle({
      backgroundColor: dark.palette.primary.dark,
      color: dark.palette.primary.contrastText,
    })
  })

  it('does not shade an unselected row', () => {
    renderRow(<TableRow data-testid="row" />)
    expect(screen.getByTestId('row')).not.toHaveStyle({
      backgroundColor: dark.palette.primary.dark,
    })
  })

  it('adds a hover background rule when isHoverable is set', () => {
    // jsdom doesn't apply :hover — assert the generated stylesheet contains a
    // hover rule for the row's class with a background-color declaration.
    renderRow(<TableRow isHoverable data-testid="row" />)
    const rowClasses = Array.from(screen.getByTestId('row').classList)
    const allRules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules))
    const hasHoverRule = allRules.some(
      (rule) =>
        rowClasses.some((cls) => rule.cssText.includes(cls)) &&
        rule.cssText.includes(':hover') &&
        rule.cssText.includes('background-color')
    )
    expect(hasHoverRule).toBe(true)
  })

  it('applies bg and borderColor theme tokens', () => {
    renderRow(<TableRow bg="paper" borderColor="light" data-testid="row" />)
    expect(screen.getByTestId('row')).toHaveStyle({
      backgroundColor: dark.background.paper,
      borderColor: dark.border.light,
    })
  })

  it('drives hover and selected shading from the color palette prop', () => {
    renderRow(<TableRow isHoverable isSelected color="secondary" data-testid="row" />)
    const row = screen.getByTestId('row')
    // selected → the palette's dark shade + contrast text
    expect(row).toHaveStyle({
      backgroundColor: dark.palette.secondary.dark,
      color: dark.palette.secondary.contrastText,
    })
    // a :hover rule exists for the row (jsdom can't apply :hover)
    const rowClasses = Array.from(row.classList)
    const allRules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules))
    const hasHoverRule = allRules.some(
      (rule) =>
        rowClasses.some((cls) => rule.cssText.includes(cls)) &&
        rule.cssText.includes(':hover') &&
        rule.cssText.includes('background-color')
    )
    expect(hasHoverRule).toBe(true)
  })

  it('forwards HTML attributes without leaking custom props to the DOM', () => {
    renderRow(<TableRow isHoverable isSelected aria-selected="true" data-testid="row" />)
    const row = screen.getByTestId('row')
    expect(row).toHaveAttribute('aria-selected', 'true')
    expect(row).not.toHaveAttribute('isHoverable')
    expect(row).not.toHaveAttribute('isSelected')
  })
})
