import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { LayoutFrame } from './LayoutFrame'

describe('LayoutFrame', () => {
  it('renders its children inside the frame', () => {
    renderWithTheme(<LayoutFrame>Framed content</LayoutFrame>)
    expect(screen.getByText('Framed content')).toBeInTheDocument()
  })

  it('lays the frame out on the theme layout grid by default', () => {
    renderWithTheme(<LayoutFrame data-testid="frame">Content</LayoutFrame>)
    expect(screen.getByTestId('frame')).toHaveStyle({ display: 'grid' })
  })

  it('spans the content across every column', () => {
    renderWithTheme(<LayoutFrame>Content</LayoutFrame>)
    // jsdom drops the grid-column shorthand from computed styles, so read the emitted rule
    const slotClass = [...screen.getByText('Content').classList].find((c) =>
      c.includes('LayoutFrame')
    )
    const rules = [...document.querySelectorAll('style')].map((s) => s.textContent).join('')
    expect(rules).toMatch(new RegExp(`\\.${slotClass}\\{[^}]*grid-column:1/-1`))
  })

  it('forwards props to the outer grid', () => {
    renderWithTheme(
      <LayoutFrame as="section" aria-label="framed" layout={{ md: { margin: 0 } }}>
        Content
      </LayoutFrame>
    )
    expect(screen.getByRole('region', { name: 'framed' }).tagName).toBe('SECTION')
  })
})
