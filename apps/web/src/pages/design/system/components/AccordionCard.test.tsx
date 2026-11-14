import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { AccordionCard } from './AccordionCard'

describe('AccordionCard', () => {
  it('opens the first section by default', () => {
    renderWithTheme(<AccordionCard />)
    expect(screen.getByText('ACCORDION')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'DEPLOY_PIPELINE' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByRole('button', { name: 'DESIGN_TOKENS' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('keeps one section open at a time', () => {
    renderWithTheme(<AccordionCard />)
    fireEvent.click(screen.getByRole('button', { name: 'ACCESSIBILITY' }))
    expect(screen.getByRole('button', { name: 'ACCESSIBILITY' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByRole('button', { name: 'DEPLOY_PIPELINE' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })
})
