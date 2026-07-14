import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { Card } from './Card'

describe('Card', () => {
  describe('children', () => {
    it('renders text children', () => {
      renderWithTheme(<Card>Hello</Card>)
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('renders element children', () => {
      renderWithTheme(
        <Card>
          <span>inner</span>
        </Card>
      )
      expect(screen.getByText('inner')).toBeInTheDocument()
    })
  })

  describe('title', () => {
    it('renders title text', () => {
      renderWithTheme(<Card title="My Title" />)
      expect(screen.getByText('My Title')).toBeInTheDocument()
    })

    it('does not render title element when title is not provided', () => {
      renderWithTheme(<Card data-testid="card" />)
      expect(screen.queryByText('My Title')).not.toBeInTheDocument()
    })

    it('renders a ReactNode title as-is', () => {
      renderWithTheme(<Card title={<em>Node Title</em>} />)
      expect(screen.getByText('Node Title').tagName).toBe('EM')
    })

    it('titleProps are applied to the title Typography', () => {
      renderWithTheme(<Card title="My Title" titleProps={{ className: 'custom-title' }} />)
      expect(screen.getByText('My Title')).toHaveClass('custom-title')
    })
  })

  describe('icon', () => {
    it('renders an icon when icon name is provided', () => {
      const { container } = renderWithTheme(<Card icon="code" />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('does not render an icon when icon is not provided', () => {
      const { container } = renderWithTheme(<Card>content</Card>)
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('forwards iconProps to the Icon', () => {
      const { container } = renderWithTheme(<Card icon="code" iconProps={{ size: '3rem' }} />)
      expect(container.querySelector('svg')).toHaveStyle({ width: '3rem', height: '3rem' })
    })
  })

  describe('caption', () => {
    it('renders caption text', () => {
      renderWithTheme(<Card caption="My Subtitle" />)
      expect(screen.getByText('My Subtitle')).toBeInTheDocument()
    })

    it('does not render caption element when caption is not provided', () => {
      renderWithTheme(<Card data-testid="card" />)
      expect(screen.queryByText('My Subtitle')).not.toBeInTheDocument()
    })

    it('captionProps are applied to the caption Typography', () => {
      renderWithTheme(<Card caption="My Subtitle" captionProps={{ className: 'custom-caption' }} />)
      expect(screen.getByText('My Subtitle')).toHaveClass('custom-caption')
    })
  })

  describe('variant', () => {
    it('renders paper variant without error', () => {
      renderWithTheme(<Card variant="paper" data-testid="card" />)
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('renders bracketBox variant without error', () => {
      renderWithTheme(<Card variant="bracketBox" data-testid="card" />)
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('renders interactive variant without error', () => {
      renderWithTheme(<Card variant="interactive" data-testid="card" />)
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('defaults to paper variant', () => {
      renderWithTheme(<Card data-testid="card" />)
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })
  })

  describe('layout', () => {
    it('defaults to flexDirection column', () => {
      renderWithTheme(<Card data-testid="card" />)
      expect(screen.getByTestId('card')).toHaveStyle({ flexDirection: 'column' })
    })

    it('flexDirection can be overridden', () => {
      renderWithTheme(<Card flexDirection="row" data-testid="card" />)
      expect(screen.getByTestId('card')).toHaveStyle({ flexDirection: 'row' })
    })
  })

  describe('HTML attribute passthrough', () => {
    it('forwards className', () => {
      renderWithTheme(<Card className="my-card">content</Card>)
      expect(screen.getByText('content')).toHaveClass('my-card')
    })

    it('forwards data attributes', () => {
      renderWithTheme(<Card data-testid="card-el">content</Card>)
      expect(screen.getByTestId('card-el')).toBeInTheDocument()
    })

    it('forwards aria attributes', () => {
      renderWithTheme(<Card aria-label="card surface" data-testid="card" />)
      expect(screen.getByTestId('card')).toHaveAttribute('aria-label', 'card surface')
    })
  })
})
