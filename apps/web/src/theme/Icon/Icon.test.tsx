import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders the named icon as an svg', () => {
    const { container } = renderWithTheme(<Icon name="hub" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('is decorative (aria-hidden) by default', () => {
    const { container } = renderWithTheme(<Icon name="hub" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('defaults size to 1.5rem on both axes', () => {
    const { container } = renderWithTheme(<Icon name="hub" />)
    expect(container.querySelector('svg')).toHaveStyle({ width: '1.5rem', height: '1.5rem' })
  })

  it('applies a custom size to width and height', () => {
    const { container } = renderWithTheme(<Icon name="hub" size="2rem" />)
    expect(container.querySelector('svg')).toHaveStyle({ width: '2rem', height: '2rem' })
  })

  it('resolves fill from the color prop via currentColor', () => {
    // color → CSS `color`; `fill: currentColor` resolves to it (theme.text.secondary)
    const { container } = renderWithTheme(<Icon name="hub" color="secondary" />)
    expect(container.querySelector('svg')).toHaveStyle({ fill: 'rgb(156, 156, 156)' })
  })

  it('forwards passthrough props to the svg element', () => {
    const { container } = renderWithTheme(<Icon name="hub" data-testid="hub-icon" />)
    expect(container.querySelector('[data-testid="hub-icon"]')).toBeInTheDocument()
  })

  it.each(['chevron_left', 'chevron_right', 'first_page', 'last_page', 'arrow_upward'] as const)(
    'renders the %s navigation icon from the registry',
    (name) => {
      const { container } = renderWithTheme(<Icon name={name} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    }
  )
})
