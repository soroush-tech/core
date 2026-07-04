import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Flicker } from './Flicker'

describe('Flicker', () => {
  describe('render', () => {
    it('renders its children', () => {
      renderWithTheme(<Flicker>signal</Flicker>)
      expect(screen.getByText('signal')).toBeInTheDocument()
    })
  })

  describe('props', () => {
    it('forwards Flex layout props', () => {
      renderWithTheme(<Flicker data-testid="flicker" alignItems="center" />)
      expect(screen.getByTestId('flicker')).toHaveStyle({ alignItems: 'center' })
    })
  })

  describe('passthrough', () => {
    it('forwards className and data attributes', () => {
      renderWithTheme(
        <Flicker className="custom" data-testid="flicker">
          signal
        </Flicker>
      )
      expect(screen.getByTestId('flicker')).toHaveClass('custom')
    })
  })
})
