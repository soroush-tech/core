import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { kineticGreen } from '../colors/kineticGreen'
import { kineticSurface } from '../colors/kineticSurface'
import { ColorPalette } from './ColorPalette'

describe('ColorPalette', () => {
  describe('header row', () => {
    it('renders the palette name', () => {
      renderWithTheme(<ColorPalette name="PRIMARY" palette={kineticGreen} />)
      expect(screen.getByText('PRIMARY')).toBeInTheDocument()
    })

    it('renders the base colour hex value', () => {
      renderWithTheme(<ColorPalette name="PRIMARY" palette={kineticGreen} />)
      expect(screen.getByText(kineticGreen.base)).toBeInTheDocument()
    })

    it('applies the base colour as background', () => {
      const { container } = renderWithTheme(<ColorPalette name="PRIMARY" palette={kineticGreen} />)
      const headerRow = container.firstElementChild!.firstElementChild!
      expect(headerRow).toHaveStyle({ backgroundColor: kineticGreen.base })
    })
  })

  describe('contrast text', () => {
    it('uses dark text on a light base colour', () => {
      renderWithTheme(<ColorPalette name="PRIMARY" palette={kineticGreen} />)
      expect(screen.getByText('PRIMARY')).toHaveStyle({ color: '#000000' })
    })

    it('uses light text on a dark base colour', () => {
      renderWithTheme(<ColorPalette name="SECONDARY" palette={kineticSurface} />)
      expect(screen.getByText('SECONDARY')).toHaveStyle({ color: '#ffffff' })
    })
  })

  describe('shade strip', () => {
    it('renders a swatch for each numeric palette entry', () => {
      const { container } = renderWithTheme(<ColorPalette name="PRIMARY" palette={kineticGreen} />)
      const shadeStrip = container.firstElementChild!.children[1]
      const expectedCount = Object.entries(kineticGreen).filter(([k]) => !isNaN(Number(k))).length
      expect(shadeStrip.children).toHaveLength(expectedCount)
    })

    it('applies the first shade as background of the first swatch', () => {
      const { container } = renderWithTheme(<ColorPalette name="PRIMARY" palette={kineticGreen} />)
      const shadeStrip = container.firstElementChild!.children[1]
      expect(shadeStrip.children[0]).toHaveStyle({ backgroundColor: kineticGreen[100] })
    })

    it('shows the hex value as a title tooltip on each swatch', () => {
      const { container } = renderWithTheme(<ColorPalette name="PRIMARY" palette={kineticGreen} />)
      const shadeStrip = container.firstElementChild!.children[1]
      expect(shadeStrip.children[0]).toHaveAttribute('title', kineticGreen[100])
    })
  })
})
