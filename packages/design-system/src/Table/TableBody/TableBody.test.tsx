import { useContext } from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../utils/test/renderWithTheme'
import { dark } from '../../themes'
import { TableSectionContext } from '../TableSectionContext'
import { TableBody } from './TableBody'

function SectionProbe() {
  const section = useContext(TableSectionContext)
  return (
    <tr>
      <td data-testid="probe" data-section={section} />
    </tr>
  )
}

describe('TableBody', () => {
  it('renders a tbody element', () => {
    renderWithTheme(
      <table>
        <TableBody data-testid="body" />
      </table>
    )
    expect(screen.getByTestId('body').tagName).toBe('TBODY')
  })

  it('overrides the root element via as', () => {
    renderWithTheme(<TableBody as="div" data-testid="body" />)
    expect(screen.getByTestId('body').tagName).toBe('DIV')
  })

  it('provides TableSectionContext with value body', () => {
    renderWithTheme(
      <table>
        <TableBody>
          <SectionProbe />
        </TableBody>
      </table>
    )
    expect(screen.getByTestId('probe')).toHaveAttribute('data-section', 'body')
  })

  it('applies bg and color theme tokens', () => {
    renderWithTheme(
      <table>
        <TableBody bg="paper" color="secondary" borderColor="light" data-testid="body" />
      </table>
    )
    expect(screen.getByTestId('body')).toHaveStyle({
      backgroundColor: dark.background.paper,
      color: dark.text.secondary,
      borderColor: dark.border.light,
    })
  })

  it('forwards HTML attributes to the element', () => {
    renderWithTheme(
      <table>
        <TableBody className="custom" aria-label="rows" data-testid="body" />
      </table>
    )
    const body = screen.getByTestId('body')
    expect(body).toHaveClass('custom')
    expect(body).toHaveAttribute('aria-label', 'rows')
  })
})
