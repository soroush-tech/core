import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Quote } from './Quote'

describe('Quote', () => {
  it('renders children inside a 2px solid left border', () => {
    renderWithTheme(<Quote>quoted text</Quote>)
    const el = screen.getByText('quoted text')
    expect(el).toBeInTheDocument()
    expect(el).toHaveStyle({ borderLeftWidth: '2px', borderLeftStyle: 'solid' })
  })
})
