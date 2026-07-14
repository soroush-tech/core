import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../utils/test/renderWithTheme'
import { dark } from '../../themes'
import { TableContainer } from './TableContainer'

describe('TableContainer', () => {
  it('renders a scrollable div', () => {
    renderWithTheme(<TableContainer data-testid="container" />)
    const container = screen.getByTestId('container')
    expect(container.tagName).toBe('DIV')
    expect(container).toHaveStyle({ overflowX: 'auto' })
  })

  it('overrides the root element via as', () => {
    renderWithTheme(<TableContainer as="section" data-testid="container" />)
    expect(screen.getByTestId('container').tagName).toBe('SECTION')
  })

  it('inherits View styling props', () => {
    renderWithTheme(<TableContainer bg="paper" p={2} maxHeight="200px" data-testid="container" />)
    expect(screen.getByTestId('container')).toHaveStyle({
      backgroundColor: dark.background.paper,
      padding: dark.space[2],
      maxHeight: '200px',
    })
  })

  it('forwards HTML attributes to the element', () => {
    renderWithTheme(<TableContainer aria-label="scrollable table" data-testid="container" />)
    expect(screen.getByTestId('container')).toHaveAttribute('aria-label', 'scrollable table')
  })
})
