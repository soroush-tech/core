import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { ScrollAreaCard } from './ScrollAreaCard'

describe('ScrollAreaCard', () => {
  it('renders a named, focusable scroll region with every log line', () => {
    renderWithTheme(<ScrollAreaCard />)
    expect(screen.getByText('SCROLL_AREA')).toBeInTheDocument()
    const region = screen.getByRole('region', { name: 'Build log' })
    expect(region).toBeInTheDocument()
    expect(screen.getByText('[01] BUILD_STEP_1 ... OK')).toBeInTheDocument()
    expect(screen.getByText('[16] BUILD_STEP_16 ... OK')).toBeInTheDocument()
  })
})
