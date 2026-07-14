import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { dark } from '../themes'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { Paper } from '../Paper'

describe('Paper', () => {
  describe('children', () => {
    it('renders text children', () => {
      renderWithTheme(<Paper>Hello</Paper>)
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('renders element children', () => {
      renderWithTheme(
        <Paper>
          <span>inner</span>
        </Paper>
      )
      expect(screen.getByText('inner')).toBeInTheDocument()
    })
  })

  describe('default surface styles', () => {
    it('defaults to bg="paper" background color', () => {
      renderWithTheme(<Paper data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({ backgroundColor: '#131313' })
    })

    it('defaults to borderRadius="sq" (0)', () => {
      renderWithTheme(<Paper data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({ borderRadius: dark.radii.sq })
    })

    it('defaults to elevation=1 box-shadow', () => {
      renderWithTheme(<Paper data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({
        boxShadow: dark.shadows[1],
      })
    })
  })

  describe('elevation', () => {
    it('elevation=0 applies flat shadow', () => {
      renderWithTheme(<Paper elevation={0} data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({
        boxShadow: dark.shadows[0],
      })
    })

    it('elevation=4 applies correct box-shadow', () => {
      renderWithTheme(<Paper elevation={4} data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({
        boxShadow: dark.shadows[4],
      })
    })

    it('elevation=24 applies maximum box-shadow', () => {
      renderWithTheme(<Paper elevation={24} data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({
        boxShadow: dark.shadows[24],
      })
    })

    it('does not forward elevation to the DOM', () => {
      renderWithTheme(<Paper elevation={2} data-testid="paper" />)
      expect(screen.getByTestId('paper')).not.toHaveAttribute('elevation')
    })
  })

  describe('bg override', () => {
    it('accepts bg prop override', () => {
      renderWithTheme(<Paper bg="primary" data-testid="paper" />)
      expect(screen.getByTestId('paper')).not.toHaveStyle({ backgroundColor: '#131313' })
    })
  })

  describe('borderRadius override', () => {
    it('borderRadius="sm" applies 4px', () => {
      renderWithTheme(<Paper borderRadius="sm" data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({ borderRadius: '4px' })
    })

    it('borderRadius="lg" applies 16px', () => {
      renderWithTheme(<Paper borderRadius="lg" data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({ borderRadius: '16px' })
    })
  })

  describe('aspectRatio', () => {
    it('applies aspect-ratio CSS property', () => {
      renderWithTheme(<Paper aspectRatio="16/9" data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({ aspectRatio: '16/9' })
    })

    it('does not forward aspectRatio to the DOM', () => {
      renderWithTheme(<Paper aspectRatio="1" data-testid="paper" />)
      expect(screen.getByTestId('paper')).not.toHaveAttribute('aspectRatio')
    })
  })

  describe('transition', () => {
    it('applies transition CSS property', () => {
      renderWithTheme(<Paper transition="box-shadow 0.3s ease" data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveStyle({ transition: 'box-shadow 0.3s ease' })
    })

    it('does not forward transition to the DOM', () => {
      renderWithTheme(<Paper transition="all 0.2s" data-testid="paper" />)
      expect(screen.getByTestId('paper')).not.toHaveAttribute('transition')
    })
  })

  describe('HTML attribute passthrough', () => {
    it('forwards className', () => {
      renderWithTheme(<Paper className="my-paper">content</Paper>)
      expect(screen.getByText('content')).toHaveClass('my-paper')
    })

    it('forwards data attributes', () => {
      renderWithTheme(<Paper data-testid="paper-el">content</Paper>)
      expect(screen.getByTestId('paper-el')).toBeInTheDocument()
    })

    it('forwards aria attributes', () => {
      renderWithTheme(<Paper aria-label="surface" data-testid="paper" />)
      expect(screen.getByTestId('paper')).toHaveAttribute('aria-label', 'surface')
    })
  })
})
