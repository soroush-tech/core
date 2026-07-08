import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { SkeletonCard } from './SkeletonCard'

const PORTRAIT_ALT = 'Portrait of Masoud Soroush, Principal Software Engineer'

describe('SkeletonCard', () => {
  it('renders the card title and all three demos', () => {
    renderWithTheme(<SkeletonCard />)
    expect(screen.getByText('SKELETON')).toBeInTheDocument()
    expect(screen.getByText('PULSE')).toBeInTheDocument()
    expect(screen.getByText('WAVE')).toBeInTheDocument()
    expect(screen.getByText('REAL_LOAD')).toBeInTheDocument()
  })

  it('renders the rectangular skeleton in each animation demo', () => {
    renderWithTheme(<SkeletonCard />)
    expect(screen.getByTestId('skeleton-pulse-rect')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-wave-rect')).toBeInTheDocument()
  })

  it('renders the loaded post the skeletons stand in for', () => {
    renderWithTheme(<SkeletonCard />)
    expect(screen.getByAltText('Soroush mascot')).toBeInTheDocument()
    expect(screen.getByText('MASOUD_SOROUSH')).toBeInTheDocument()
    expect(screen.getByText('PRINCIPAL_ENGINEER')).toBeInTheDocument()
    expect(screen.getByAltText(PORTRAIT_ALT)).toBeInTheDocument()
  })

  it('renders the responsive picture with a source per format', () => {
    const { container } = renderWithTheme(<SkeletonCard />)
    const sources = container.querySelectorAll('picture > source')
    expect(sources).toHaveLength(2) // avif + webp from the imagetools mock
    for (const source of sources) {
      expect(source).toHaveAttribute('srcset')
      expect(source).toHaveAttribute('sizes')
    }
    expect(screen.getByAltText(PORTRAIT_ALT)).toHaveAttribute('sizes')
  })
})
