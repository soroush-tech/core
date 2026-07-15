import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { Icon } from './Icon'
import { icons, type IconName } from './icons'

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

  it('preserves fill="none" on stroke-based icon paths (icons are generated without svgo)', () => {
    // Icon's root CSS sets `fill: currentColor`, which paths inherit unless they
    // carry their own fill attribute — stroke icons must keep `fill="none"` or
    // they render as filled blobs. Guards the svgr --no-svgo generation contract.
    const { container } = renderWithTheme(<Icon name="external_link" />)
    expect(container.querySelector('path')).toHaveAttribute('fill', 'none')
  })

  it.each(Object.keys(icons) as IconName[])('renders the %s icon from the registry', (name) => {
    const { container } = renderWithTheme(<Icon name={name} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.querySelector('path, circle, rect, line, polyline, polygon')).toBeInTheDocument()
  })
})
