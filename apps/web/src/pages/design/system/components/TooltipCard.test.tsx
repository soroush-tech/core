import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { TooltipCard } from './TooltipCard'

describe('TooltipCard', () => {
  it('renders the title and a trigger for every placement', () => {
    renderWithTheme(<TooltipCard />)
    expect(screen.getByText('TOOLTIP')).toBeInTheDocument()
    for (const name of ['TOP', 'BOTTOM', 'LEFT', 'RIGHT']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('opens the tooltip when its trigger is hovered', async () => {
    renderWithTheme(<TooltipCard />)
    fireEvent.mouseOver(screen.getByRole('button', { name: 'BOTTOM' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Placed bottom')
  })
})
