import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { CardTitle } from './CardTitle'

describe('CardTitle', () => {
  it('renders the title text', () => {
    renderWithTheme(<CardTitle title="AVATAR" />)
    expect(screen.getByText('AVATAR')).toBeInTheDocument()
  })

  it('renders a docs link when docsHref is provided', () => {
    renderWithTheme(<CardTitle title="X" docsHref="https://docs.test/x/" />)
    expect(screen.getByRole('link', { name: /DOCS/i })).toHaveAttribute(
      'href',
      'https://docs.test/x/'
    )
  })

  it('does not render a docs link when docsHref is omitted', () => {
    renderWithTheme(<CardTitle title="X" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
