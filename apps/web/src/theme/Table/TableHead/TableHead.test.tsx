import { useContext } from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { dark } from 'src/theme/themes'
import { TableSectionContext } from 'src/theme/Table/TableSectionContext'
import { TableHead } from './TableHead'

function SectionProbe() {
  const section = useContext(TableSectionContext)
  return (
    <tr>
      <td data-testid="probe" data-section={section} />
    </tr>
  )
}

describe('TableHead', () => {
  it('renders a thead element', () => {
    renderWithTheme(
      <table>
        <TableHead data-testid="head" />
      </table>
    )
    expect(screen.getByTestId('head').tagName).toBe('THEAD')
  })

  it('overrides the root element via as', () => {
    renderWithTheme(<TableHead as="div" data-testid="head" />)
    expect(screen.getByTestId('head').tagName).toBe('DIV')
  })

  it('provides TableSectionContext with value head', () => {
    renderWithTheme(
      <table>
        <TableHead>
          <SectionProbe />
        </TableHead>
      </table>
    )
    expect(screen.getByTestId('probe')).toHaveAttribute('data-section', 'head')
  })

  it('applies bg and color theme tokens', () => {
    renderWithTheme(
      <table>
        <TableHead bg="secondary" color="primary" borderColor="primary" data-testid="head" />
      </table>
    )
    expect(screen.getByTestId('head')).toHaveStyle({
      backgroundColor: dark.background.secondary,
      color: dark.text.primary,
      borderColor: dark.border.primary,
    })
  })

  it('forwards HTML attributes to the element', () => {
    renderWithTheme(
      <table>
        <TableHead className="custom" aria-label="columns" data-testid="head" />
      </table>
    )
    const head = screen.getByTestId('head')
    expect(head).toHaveClass('custom')
    expect(head).toHaveAttribute('aria-label', 'columns')
  })
})
