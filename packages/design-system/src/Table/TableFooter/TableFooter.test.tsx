import { useContext } from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '@soroush.tech/design-system/utils/test/renderWithTheme'
import { baseTheme } from '@soroush.tech/design-system/theme'
import { TableSectionContext } from '../TableSectionContext'
import { TableFooter } from './TableFooter'

function SectionProbe() {
  const section = useContext(TableSectionContext)
  return (
    <tr>
      <td data-testid="probe" data-section={section} />
    </tr>
  )
}

describe('TableFooter', () => {
  it('renders a tfoot element', () => {
    renderWithTheme(
      <table>
        <TableFooter data-testid="footer" />
      </table>
    )
    expect(screen.getByTestId('footer').tagName).toBe('TFOOT')
  })

  it('overrides the root element via as', () => {
    renderWithTheme(<TableFooter as="div" data-testid="footer" />)
    expect(screen.getByTestId('footer').tagName).toBe('DIV')
  })

  it('provides TableSectionContext with value footer', () => {
    renderWithTheme(
      <table>
        <TableFooter>
          <SectionProbe />
        </TableFooter>
      </table>
    )
    expect(screen.getByTestId('probe')).toHaveAttribute('data-section', 'footer')
  })

  it('applies bg and color theme tokens', () => {
    renderWithTheme(
      <table>
        <TableFooter bg="secondary" color="secondary" borderColor="dark" data-testid="footer" />
      </table>
    )
    expect(screen.getByTestId('footer')).toHaveStyle({
      backgroundColor: baseTheme.background.secondary,
      color: baseTheme.text.secondary,
      borderColor: baseTheme.border.dark,
    })
  })

  it('forwards HTML attributes to the element', () => {
    renderWithTheme(
      <table>
        <TableFooter className="custom" aria-label="totals" data-testid="footer" />
      </table>
    )
    const footer = screen.getByTestId('footer')
    expect(footer).toHaveClass('custom')
    expect(footer).toHaveAttribute('aria-label', 'totals')
  })
})
