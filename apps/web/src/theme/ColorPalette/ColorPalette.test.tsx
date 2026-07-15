import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { ColorPalette } from './ColorPalette'

// Palette-shaped fixtures — the component renders any name + swatch record.
const samplePalette = {
  get base() {
    return this[500]
  },
  100: '#E8FFE5',
  500: '#00FC40',
  900: '#003F0A',
}

const darkPalette = {
  get base() {
    return this[900]
  },
  100: '#FFFFFF',
  900: '#0E0E0E',
}

describe('ColorPalette', () => {
  describe('header row', () => {
    it('renders the palette name', () => {
      renderWithTheme(<ColorPalette name="PRIMARY" palette={samplePalette} />)
      expect(screen.getByText('PRIMARY')).toBeInTheDocument()
    })

    it('renders the base colour hex value', () => {
      renderWithTheme(<ColorPalette name="PRIMARY" palette={samplePalette} />)
      expect(screen.getByText(samplePalette.base)).toBeInTheDocument()
    })

    it('applies the base colour as background', () => {
      const { container } = renderWithTheme(<ColorPalette name="PRIMARY" palette={samplePalette} />)
      const headerRow = container.firstElementChild!.firstElementChild!
      expect(headerRow).toHaveStyle({ backgroundColor: samplePalette.base })
    })
  })

  describe('contrast text', () => {
    it('uses dark text on a light base colour', () => {
      renderWithTheme(<ColorPalette name="PRIMARY" palette={samplePalette} />)
      expect(screen.getByText('PRIMARY')).toHaveStyle({ color: '#000000' })
    })

    it('uses light text on a dark base colour', () => {
      renderWithTheme(<ColorPalette name="SECONDARY" palette={darkPalette} />)
      expect(screen.getByText('SECONDARY')).toHaveStyle({ color: '#ffffff' })
    })
  })

  describe('shade strip', () => {
    it('renders a swatch for each numeric palette entry', () => {
      const { container } = renderWithTheme(<ColorPalette name="PRIMARY" palette={samplePalette} />)
      const shadeStrip = container.firstElementChild!.children[1]
      const expectedCount = Object.entries(samplePalette).filter(([k]) => !isNaN(Number(k))).length
      expect(shadeStrip.children).toHaveLength(expectedCount)
    })

    it('applies the first shade as background of the first swatch', () => {
      const { container } = renderWithTheme(<ColorPalette name="PRIMARY" palette={samplePalette} />)
      const shadeStrip = container.firstElementChild!.children[1]
      expect(shadeStrip.children[0]).toHaveStyle({ backgroundColor: samplePalette[100] })
    })

    it('shows the hex value as a title tooltip on each swatch', () => {
      const { container } = renderWithTheme(<ColorPalette name="PRIMARY" palette={samplePalette} />)
      const shadeStrip = container.firstElementChild!.children[1]
      expect(shadeStrip.children[0]).toHaveAttribute('title', samplePalette[100])
    })
  })
})
