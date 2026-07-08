import { screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Image } from '../Image'

describe('Image', () => {
  describe('source priority', () => {
    it('renders img when src is provided', () => {
      renderWithTheme(<Image src="photo.jpg" alt="Test" />)
      expect(screen.getByRole('img')).toHaveAttribute('src', 'photo.jpg')
    })

    it('uses srcSet as source when src is absent', () => {
      renderWithTheme(<Image srcSet="photo.jpg" alt="Test" />)
      expect(screen.getByRole('img')).toHaveAttribute('srcset', 'photo.jpg')
    })

    it('prefers src over fallback', () => {
      renderWithTheme(<Image src="primary.jpg" fallback="fallback.jpg" alt="Test" />)
      expect(screen.getByRole('img')).toHaveAttribute('src', 'primary.jpg')
    })

    it('prefers srcSet over fallback when src is absent', () => {
      renderWithTheme(<Image srcSet="photo.jpg" fallback="fallback.jpg" alt="Test" />)
      expect(screen.getByRole('img')).toHaveAttribute('srcset', 'photo.jpg')
    })

    it('renders fallback as src when only fallback is provided', () => {
      renderWithTheme(<Image fallback="fallback.jpg" alt="Test" />)
      expect(screen.getByRole('img')).toHaveAttribute('src', 'fallback.jpg')
    })
  })

  describe('error handling', () => {
    it('switches to fallback when src errors', async () => {
      renderWithTheme(<Image src="broken.jpg" fallback="/soroush.svg" alt="Test" />)
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByRole('img')).toHaveAttribute('src', '/soroush.svg')
    })

    it('calls onError when all sources are exhausted', async () => {
      const onError = vi.fn()
      renderWithTheme(<Image src="broken.jpg" alt="Test" onError={onError} />)
      fireEvent.error(screen.getByRole('img'))
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('calls onError only after both src and fallback fail', async () => {
      const onError = vi.fn()
      renderWithTheme(
        <Image src="broken.jpg" fallback="broken-fallback.jpg" alt="Test" onError={onError} />
      )
      fireEvent.error(screen.getByRole('img'))
      expect(onError).not.toHaveBeenCalled()
      fireEvent.error(await screen.findByRole('img'))
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('srcSet fails → switches to fallback', async () => {
      renderWithTheme(<Image srcSet="broken.jpg" fallback="/soroush.svg" alt="Test" />)
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByRole('img')).toHaveAttribute('src', '/soroush.svg')
    })

    it('srcSet+src both present, srcSet fails → drops srcSet, retains src', async () => {
      renderWithTheme(<Image src="photo.jpg" srcSet="broken@2x.jpg 2x" alt="Test" />)
      fireEvent.error(screen.getByRole('img'))
      const img = await screen.findByRole('img')
      expect(img).toHaveAttribute('src', 'photo.jpg')
      expect(img).not.toHaveAttribute('srcset')
    })

    it('srcSet+src both present, both fail, fallback present → switches to fallback', async () => {
      renderWithTheme(
        <Image src="broken.jpg" srcSet="broken@2x.jpg 2x" fallback="/soroush.svg" alt="Test" />
      )
      fireEvent.error(screen.getByRole('img'))
      fireEvent.error(await screen.findByRole('img'))
      expect(await screen.findByRole('img')).toHaveAttribute('src', '/soroush.svg')
    })

    it('srcSet+src both present, both fail, no fallback → calls onError', async () => {
      const onError = vi.fn()
      renderWithTheme(
        <Image src="broken.jpg" srcSet="broken@2x.jpg 2x" alt="Test" onError={onError} />
      )
      fireEvent.error(screen.getByRole('img'))
      expect(onError).not.toHaveBeenCalled()
      fireEvent.error(await screen.findByRole('img'))
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('resets when src changes', async () => {
      const { rerender } = renderWithTheme(<Image src="broken.jpg" alt="Test" />)
      fireEvent.error(screen.getByRole('img'))

      await act(async () => {
        rerender(<Image src="/soroush.svg" alt="Test" />)
      })
      expect(screen.getByRole('img')).toHaveAttribute('src', '/soroush.svg')
    })

    it('resets when srcSet changes', async () => {
      const { rerender } = renderWithTheme(<Image srcSet="broken.jpg" alt="Test" />)
      fireEvent.error(screen.getByRole('img'))

      await act(async () => {
        rerender(<Image srcSet="/soroush.svg" alt="Test" />)
      })
      expect(screen.getByRole('img')).toHaveAttribute('srcset', '/soroush.svg')
    })

    it('resets when fallback changes', async () => {
      const { rerender } = renderWithTheme(
        <Image src="broken.jpg" fallback="old-fb.jpg" alt="Test" />
      )
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByRole('img')).toHaveAttribute('src', 'old-fb.jpg')

      await act(async () => {
        rerender(<Image src="broken.jpg" fallback="/soroush.svg" alt="Test" />)
      })
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByRole('img')).toHaveAttribute('src', '/soroush.svg')
    })

    it('fallback-only: calls onError after retrying the same URL in the fallback phase', async () => {
      const onError = vi.fn()
      renderWithTheme(<Image fallback="broken.jpg" alt="Test" onError={onError} />)
      fireEvent.error(screen.getByRole('img'))
      expect(onError).not.toHaveBeenCalled()
      fireEvent.error(await screen.findByRole('img'))
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('is a no-op when an error fires in the failed phase', async () => {
      const onError = vi.fn()
      renderWithTheme(<Image src="broken.jpg" alt="Test" onError={onError} />)
      fireEvent.error(screen.getByRole('img')) // initial → failed (no fallback)
      await act(async () => {}) // flush phase='failed' re-render
      expect(onError).toHaveBeenCalledTimes(1)
      fireEvent.error(screen.getByRole('img')) // failed → no-op (covers false branch of if phase==='fallback')
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('does not throw when fallback also fails and onError is not provided', async () => {
      renderWithTheme(<Image src="broken.jpg" fallback="broken-fallback.jpg" alt="Test" />)
      fireEvent.error(screen.getByRole('img'))
      fireEvent.error(await screen.findByRole('img'))
      // reaching here covers the onError?.() no-op branch inside phase === 'fallback'
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('srcSet-only with no fallback calls onError on the first error', () => {
      const onError = vi.fn()
      renderWithTheme(<Image srcSet="broken.jpg" alt="Test" onError={onError} />)
      fireEvent.error(screen.getByRole('img'))
      expect(onError).toHaveBeenCalledTimes(1)
    })
  })

  describe('img attributes', () => {
    it('forwards alt to the img element', () => {
      renderWithTheme(<Image src="photo.jpg" alt="Profile photo" />)
      expect(screen.getByAltText('Profile photo')).toBeInTheDocument()
    })

    it('forwards srcSet when src is present', () => {
      renderWithTheme(<Image src="photo.jpg" srcSet="photo@2x.jpg 2x" alt="Test" />)
      expect(screen.getByRole('img')).toHaveAttribute('srcset', 'photo@2x.jpg 2x')
    })
  })

  describe('CSS props', () => {
    it('objectFit applies the correct CSS', () => {
      renderWithTheme(<Image src="photo.jpg" alt="Test" objectFit="cover" />)
      expect(screen.getByRole('img')).toHaveStyle({ objectFit: 'cover' })
    })

    it('objectPosition applies the correct CSS', () => {
      renderWithTheme(<Image src="photo.jpg" alt="Test" objectPosition="top left" />)
      expect(screen.getByRole('img')).toHaveStyle({ objectPosition: 'top left' })
    })

    it('borderRadius resolves against theme.radii', () => {
      renderWithTheme(<Image src="photo.jpg" alt="Test" borderRadius="md" />)
      expect(screen.getByRole('img')).toHaveStyle({ borderRadius: '8px' })
    })
  })
})
