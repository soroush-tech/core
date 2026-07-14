import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { View } from '../View'

describe('View', () => {
  describe('children', () => {
    it('renders text children', () => {
      renderWithTheme(<View>Hello</View>)
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('renders element children', () => {
      renderWithTheme(
        <View>
          <span>inner</span>
        </View>
      )
      expect(screen.getByText('inner')).toBeInTheDocument()
    })
  })

  describe('renders as div', () => {
    it('renders a div by default', () => {
      renderWithTheme(<View>el</View>)
      expect(screen.getByText('el').tagName).toBe('DIV')
    })
  })

  describe('space props — theme.space scale', () => {
    it.each([
      [1, '8px'],
      [2, '16px'],
      [3, '24px'],
    ] as const)('p={%s} resolves to %s', (token, px) => {
      renderWithTheme(<View p={token}>{px}</View>)
      expect(screen.getByText(px)).toHaveStyle({ padding: px })
    })

    it('applies margin from theme scale', () => {
      renderWithTheme(
        <View mt={2} mb={1}>
          spaced
        </View>
      )
      expect(screen.getByText('spaced')).toHaveStyle({ marginTop: '16px', marginBottom: '8px' })
    })
  })

  describe('layout props', () => {
    it('applies width and height', () => {
      renderWithTheme(
        <View width="200px" height="100px">
          sized
        </View>
      )
      expect(screen.getByText('sized')).toHaveStyle({ width: '200px', height: '100px' })
    })
  })

  describe('position props', () => {
    it('applies position and offsets', () => {
      renderWithTheme(
        <View position="absolute" top="10px" left="20px">
          pos
        </View>
      )
      expect(screen.getByText('pos')).toHaveStyle({
        position: 'absolute',
        top: '10px',
        left: '20px',
      })
    })
  })

  describe('border props', () => {
    it('applies borderRadius from theme.radii', () => {
      renderWithTheme(<View borderRadius="sm">rounded</View>)
      expect(screen.getByText('rounded')).toHaveStyle({ borderRadius: '4px' })
    })
  })

  describe('cursor prop', () => {
    it('applies cursor CSS property', () => {
      renderWithTheme(<View cursor="pointer">clickable</View>)
      expect(screen.getByText('clickable')).toHaveStyle({ cursor: 'pointer' })
    })

    it('does not forward cursor as a DOM attribute', () => {
      renderWithTheme(<View cursor="pointer">clickable</View>)
      expect(screen.getByText('clickable')).not.toHaveAttribute('cursor')
    })
  })

  describe('order prop', () => {
    it('applies order CSS property', () => {
      renderWithTheme(<View order={2}>ordered</View>)
      expect(screen.getByText('ordered')).toHaveStyle({ order: '2' })
    })

    it('does not forward order as a DOM attribute', () => {
      renderWithTheme(<View order={2}>ordered</View>)
      expect(screen.getByText('ordered')).not.toHaveAttribute('order')
    })
  })

  describe('HTML attribute passthrough', () => {
    it('forwards className', () => {
      renderWithTheme(<View className="my-view">classed</View>)
      expect(screen.getByText('classed')).toHaveClass('my-view')
    })

    it('forwards data attributes', () => {
      renderWithTheme(<View data-testid="test-view">data</View>)
      expect(screen.getByTestId('test-view')).toBeInTheDocument()
    })

    it('forwards style prop', () => {
      renderWithTheme(<View style={{ opacity: 0.5 }}>styled</View>)
      expect(screen.getByText('styled')).toHaveStyle({ opacity: '0.5' })
    })

    it('does not forward styled-system props to the DOM', () => {
      renderWithTheme(<View p={2}>no-attr</View>)
      expect(screen.getByText('no-attr')).not.toHaveAttribute('p')
    })
  })
})
