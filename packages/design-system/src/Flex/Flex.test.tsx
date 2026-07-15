import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { Flex } from '../Flex'

describe('Flex', () => {
  describe('children', () => {
    it('renders text children', () => {
      renderWithTheme(<Flex>Flex Child</Flex>)
      expect(screen.getByText('Flex Child')).toBeInTheDocument()
    })

    it('renders multiple element children', () => {
      renderWithTheme(
        <Flex>
          <div>A</div>
          <div>B</div>
        </Flex>
      )
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
    })
  })

  describe('display', () => {
    it('has display: flex by default', () => {
      renderWithTheme(<Flex>flex-el</Flex>)
      expect(screen.getByText('flex-el')).toHaveStyle({ display: 'flex' })
    })
  })

  describe('flexDirection', () => {
    it('defaults to column', () => {
      renderWithTheme(<Flex>col</Flex>)
      expect(screen.getByText('col')).toHaveStyle({ flexDirection: 'column' })
    })

    it('accepts flexDirection="row"', () => {
      renderWithTheme(<Flex flexDirection="row">row</Flex>)
      expect(screen.getByText('row')).toHaveStyle({ flexDirection: 'row' })
    })

    it('accepts flexDirection="column"', () => {
      renderWithTheme(<Flex flexDirection="column">col</Flex>)
      expect(screen.getByText('col')).toHaveStyle({ flexDirection: 'column' })
    })
  })

  describe('flexbox props', () => {
    it('applies justifyContent', () => {
      renderWithTheme(<Flex justifyContent="space-between">jc</Flex>)
      expect(screen.getByText('jc')).toHaveStyle({ justifyContent: 'space-between' })
    })

    it('applies alignItems', () => {
      renderWithTheme(<Flex alignItems="center">ai</Flex>)
      expect(screen.getByText('ai')).toHaveStyle({ alignItems: 'center' })
    })
  })

  describe('gap — theme.space scale', () => {
    it.each([
      [1, '8px'],
      [2, '16px'],
      [3, '24px'],
    ] as const)('gap={%s} resolves to %s', (token, px) => {
      renderWithTheme(<Flex gap={token}>{px}</Flex>)
      expect(screen.getByText(px)).toHaveStyle({ gap: px })
    })

    it('does not forward gap as an HTML attribute', () => {
      renderWithTheme(<Flex gap={2}>no-attr</Flex>)
      expect(screen.getByText('no-attr')).not.toHaveAttribute('gap')
    })
  })

  describe('inherited View props', () => {
    it('applies space props from theme scale', () => {
      renderWithTheme(<Flex p={2}>padded</Flex>)
      expect(screen.getByText('padded')).toHaveStyle({ padding: '16px' })
    })

    it('applies layout width prop', () => {
      renderWithTheme(<Flex width="300px">sized</Flex>)
      expect(screen.getByText('sized')).toHaveStyle({ width: '300px' })
    })
  })

  describe('HTML attribute passthrough', () => {
    it('forwards className', () => {
      renderWithTheme(<Flex className="my-flex">classed</Flex>)
      expect(screen.getByText('classed')).toHaveClass('my-flex')
    })

    it('forwards data attributes', () => {
      renderWithTheme(<Flex data-testid="test-flex">data</Flex>)
      expect(screen.getByTestId('test-flex')).toBeInTheDocument()
    })

    it('does not forward styled-system props to the DOM', () => {
      renderWithTheme(<Flex p={2}>no-attr</Flex>)
      expect(screen.getByText('no-attr')).not.toHaveAttribute('p')
    })
  })
})
