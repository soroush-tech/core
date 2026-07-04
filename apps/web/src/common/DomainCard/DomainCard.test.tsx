import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { DomainCard } from './DomainCard'

const defaultProps = {
  index: 1,
  title: 'REAL-TIME SYSTEMS',
  description: 'Focus on live systems requiring synchronization.',
  tags: ['WEBSOCKETS', 'RUST_ACTORS'],
}

const imagesFixture = {
  sources: { avif: '/img.avif', webp: '/img.webp' },
  img: { src: '/img.png', w: 360, h: 360 },
}

describe('DomainCard', () => {
  describe('module badge', () => {
    it('renders the module badge', () => {
      renderWithTheme(<DomainCard {...defaultProps} />)
      expect(screen.getByText('#01')).toBeInTheDocument()
    })

    it('pads single-digit index to two digits', () => {
      renderWithTheme(<DomainCard {...defaultProps} index={9} />)
      expect(screen.getByText('#09')).toBeInTheDocument()
    })

    it('renders double-digit index without padding', () => {
      renderWithTheme(<DomainCard {...defaultProps} index={10} />)
      expect(screen.getByText('#10')).toBeInTheDocument()
    })

    it('renders a custom badge in place of the index when provided', () => {
      renderWithTheme(<DomainCard {...defaultProps} badge="v1.2.3" />)
      expect(screen.getByText('v1.2.3')).toBeInTheDocument()
      expect(screen.queryByText('#01')).not.toBeInTheDocument()
    })
  })

  describe('content', () => {
    it('renders title', () => {
      renderWithTheme(<DomainCard {...defaultProps} />)
      expect(screen.getByText('REAL-TIME SYSTEMS')).toBeInTheDocument()
    })

    it('renders description', () => {
      renderWithTheme(<DomainCard {...defaultProps} />)
      expect(
        screen.getByText('Focus on live systems requiring synchronization.')
      ).toBeInTheDocument()
    })

    it('renders all tags', () => {
      renderWithTheme(<DomainCard {...defaultProps} />)
      expect(screen.getByText('WEBSOCKETS')).toBeInTheDocument()
      expect(screen.getByText('RUST_ACTORS')).toBeInTheDocument()
    })
  })

  describe('image', () => {
    it('renders the fallback img and a source per format when provided', () => {
      const { container } = renderWithTheme(
        <DomainCard {...defaultProps} images={imagesFixture} imageAlt="test image" />
      )
      const img = screen.getByRole('img', { name: 'test image' })
      expect(img).toHaveAttribute('src', '/img.png')

      const sources = container.querySelectorAll('source')
      expect(sources).toHaveLength(2)
      expect(sources[0]).toHaveAttribute('type', 'image/avif')
      expect(sources[0]).toHaveAttribute('srcset', '/img.avif')
    })

    it('renders image with empty alt when imageAlt is omitted', () => {
      const { container } = renderWithTheme(<DomainCard {...defaultProps} images={imagesFixture} />)
      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', '')
    })

    it('does not render image when not provided', () => {
      renderWithTheme(<DomainCard {...defaultProps} />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('featured variant', () => {
    it('renders the featured image as a responsive square', () => {
      const { container } = renderWithTheme(
        <DomainCard {...defaultProps} images={imagesFixture} imageAlt="featured" featured />
      )
      const imageWrapper = container.querySelector('picture')?.parentElement
      expect(imageWrapper).toHaveStyle({ aspectRatio: '1 / 1' })
    })

    it('renders title at larger font size when featured', () => {
      renderWithTheme(<DomainCard {...defaultProps} featured />)
      const heading = screen.getByText('REAL-TIME SYSTEMS')
      expect(heading).toBeInTheDocument()
    })
  })

  describe('children slot', () => {
    it('renders footer children when provided', () => {
      renderWithTheme(
        <DomainCard {...defaultProps}>
          <button type="button">Action</button>
        </DomainCard>
      )
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })

  describe('HTML attribute passthrough', () => {
    it('forwards className', () => {
      const { container } = renderWithTheme(<DomainCard {...defaultProps} className="custom" />)
      expect(container.firstChild).toHaveClass('custom')
    })

    it('forwards style prop', () => {
      const { container } = renderWithTheme(
        <DomainCard {...defaultProps} style={{ gridColumn: '1 / -1' }} />
      )
      expect(container.firstChild).toHaveStyle({ gridColumn: '1 / -1' })
    })
  })
})
