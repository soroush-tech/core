import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { ImageCard } from './ImageCard'

describe('ImageCard', () => {
  it('renders the card title', () => {
    renderWithTheme(<ImageCard />)
    expect(screen.getByText('IMAGE')).toBeInTheDocument()
  })

  it('renders an image per object-fit demo', () => {
    renderWithTheme(<ImageCard />)
    expect(screen.getByText('OBJECT_FIT_COVER')).toBeInTheDocument()
    expect(screen.getByText('OBJECT_FIT_CONTAIN')).toBeInTheDocument()
    expect(screen.getByAltText('Soroush mascot debugging, object-fit cover')).toBeInTheDocument()
    expect(screen.getByAltText('Soroush mascot debugging, object-fit contain')).toBeInTheDocument()
  })

  it('recovers to the fallback source after the primary src errors', () => {
    renderWithTheme(<ImageCard />)
    const image = screen.getByAltText<HTMLImageElement>(
      'Soroush mascot exploring, loaded via fallback'
    )
    expect(image.src).toContain('broken-source.png')
    fireEvent.error(image)
    expect(image.src).not.toContain('broken-source.png')
  })
})
