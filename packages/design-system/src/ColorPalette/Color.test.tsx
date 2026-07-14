import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { Color } from './Color'

describe('Color', () => {
  it('applies the hex value as backgroundColor', () => {
    const { container } = renderWithTheme(<Color color="#00FC40" />)
    expect(container.firstElementChild).toHaveStyle({ backgroundColor: '#00FC40' })
  })

  it('sets the title attribute to the hex value', () => {
    const { container } = renderWithTheme(<Color color="#00FC40" />)
    expect(container.firstElementChild).toHaveAttribute('title', '#00FC40')
  })

  it('passes through Flex props', () => {
    const { container } = renderWithTheme(<Color color="#00FC40" flex="1" height="48px" />)
    expect(container.firstElementChild).toHaveStyle({ flex: '1', height: '48px' })
  })
})
