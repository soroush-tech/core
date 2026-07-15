import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { ThemeProvider } from '../ThemeProvider'
import { createTheme, baseTheme } from '../themes'
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

  describe('theme.components.Card', () => {
    const withComponents = (
      components: NonNullable<Parameters<typeof createTheme>[1]['components']>,
      ui: React.ReactNode
    ) => render(<ThemeProvider theme={createTheme(baseTheme, { components })}>{ui}</ThemeProvider>)

    it('defaultProps.titleProps restyle the title tokens (variant changes the element)', () => {
      withComponents(
        { Card: { defaultProps: { titleProps: { variant: 'subtitle1', color: 'secondary' } } } },
        <Card title="My Title" />
      )
      const heading = screen.getByText('My Title')
      expect(heading.tagName).toBe('H6') // subtitle1 renders as h6 instead of overline's span
      expect(heading).toHaveStyle({ color: baseTheme.text.secondary })
    })

    it('per-instance titleProps beat the theme titleProps', () => {
      withComponents(
        { Card: { defaultProps: { titleProps: { color: 'secondary' } } } },
        <Card title="My Title" titleProps={{ color: 'error' }} />
      )
      expect(screen.getByText('My Title')).toHaveStyle({ color: baseTheme.text.error })
    })

    it('defaultProps.iconProps restyle the icon (instance iconProps still win)', () => {
      withComponents(
        { Card: { defaultProps: { iconProps: { color: 'warning', size: '3rem' } } } },
        <Card icon="code" />
      )
      const svg = document.querySelector('svg')
      expect(svg).toHaveStyle({ width: '3rem', height: '3rem' })
      expect(svg).toHaveStyle({ fill: baseTheme.text.warning })
    })

    it('defaultProps.captionProps restyle the caption', () => {
      withComponents(
        { Card: { defaultProps: { captionProps: { color: 'warning' } } } },
        <Card caption="My Subtitle" />
      )
      expect(screen.getByText('My Subtitle')).toHaveStyle({ color: baseTheme.text.warning })
    })

    it('styleOverrides target the title and caption slots independently', () => {
      withComponents(
        {
          Card: {
            styleOverrides: {
              title: { letterSpacing: '0.5em' },
              caption: { textDecoration: 'underline' },
            },
          },
        },
        <Card title="My Title" caption="My Subtitle" />
      )
      expect(screen.getByText('My Title')).toHaveStyle({ letterSpacing: '0.5em' })
      expect(screen.getByText('My Subtitle')).toHaveStyle({ textDecoration: 'underline' })
      expect(screen.getByText('My Title')).not.toHaveStyle({ textDecoration: 'underline' })
    })

    it('styleOverrides.root receives ownerState for variant-conditional CSS', () => {
      withComponents(
        {
          Card: {
            styleOverrides: {
              root: ({ ownerState }) => ({
                outlineStyle: ownerState.variant === 'interactive' ? 'dashed' : 'none',
              }),
            },
          },
        },
        <Card variant="interactive" data-testid="card" />
      )
      expect(screen.getByTestId('card')).toHaveStyle({ outlineStyle: 'dashed' })
    })

    it('defaultProps.variant applies when no variant prop is passed', () => {
      withComponents(
        { Card: { defaultProps: { variant: 'bracketBox' } } },
        <Card data-testid="card" />
      )
      expect(screen.getByTestId('card')).toHaveStyle({ borderTopLeftRadius: '0' })
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
