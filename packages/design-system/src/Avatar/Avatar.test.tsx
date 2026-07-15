import { screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { Avatar } from '../Avatar'

describe('Avatar', () => {
  describe('image rendering', () => {
    it('applies alt attribute to the img element', () => {
      renderWithTheme(<Avatar src="test.jpg" alt="Test user" />)
      expect(screen.getByAltText('Test user')).toBeInTheDocument()
    })

    it('applies srcSet to the img element', () => {
      renderWithTheme(<Avatar src="test.jpg" srcSet="test@2x.jpg 2x" alt="Test" />)
      expect(screen.getByRole('img')).toHaveAttribute('srcset', 'test@2x.jpg 2x')
    })
  })

  describe('fallback content', () => {
    it('renders children and no img when no src or fallback is provided', () => {
      renderWithTheme(<Avatar>MS</Avatar>)
      expect(screen.getByText('MS')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders img and hides children when src is provided', () => {
      renderWithTheme(
        <Avatar src="test.jpg" alt="Test">
          MS
        </Avatar>
      )
      expect(screen.getByRole('img')).toBeInTheDocument()
      expect(screen.queryByText('MS')).not.toBeInTheDocument()
    })

    it('uses srcSet as image source when src is absent', () => {
      renderWithTheme(<Avatar srcSet="image.jpg" alt="Test" />)
      expect(screen.getByRole('img')).toHaveAttribute('srcset', 'image.jpg')
    })

    it('uses fallback image when src is absent', () => {
      renderWithTheme(
        <Avatar fallback="fallback.jpg" alt="Fallback">
          MS
        </Avatar>
      )
      expect(screen.getByRole('img')).toHaveAttribute('src', 'fallback.jpg')
      expect(screen.queryByText('MS')).not.toBeInTheDocument()
    })

    it('prefers src over fallback when both are provided', () => {
      renderWithTheme(<Avatar src="primary.jpg" fallback="fallback.jpg" alt="Test" />)
      expect(screen.getByRole('img')).toHaveAttribute('src', 'primary.jpg')
    })

    it('shows children when both primary and fallback images error', async () => {
      renderWithTheme(
        <Avatar src="broken.jpg" fallback="also-broken.jpg" alt="Test">
          MS
        </Avatar>
      )
      fireEvent.error(screen.getByRole('img'))
      fireEvent.error(await screen.findByRole('img'))
      expect(await screen.findByText('MS')).toBeInTheDocument()
    })

    it('invalid src errors with no fallback → shows children', async () => {
      renderWithTheme(
        <Avatar src="invalid.jpg" alt="Test">
          MS
        </Avatar>
      )
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByText('MS')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('invalid src errors → shows fallback image, not children', async () => {
      renderWithTheme(
        <Avatar src="invalid.jpg" fallback="/soroush.svg" alt="Test">
          MS
        </Avatar>
      )
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByRole('img')).toHaveAttribute('src', '/soroush.svg')
      expect(screen.queryByText('MS')).not.toBeInTheDocument()
    })

    it('valid src loads — no fallback or children shown', () => {
      renderWithTheme(
        <Avatar src="/soroush.svg" fallback="fallback.jpg" alt="Test">
          MS
        </Avatar>
      )
      expect(screen.getByRole('img')).toHaveAttribute('src', '/soroush.svg')
      expect(screen.queryByText('MS')).not.toBeInTheDocument()
    })

    it('invalid srcSet with no fallback → shows children', async () => {
      renderWithTheme(
        <Avatar srcSet="invalid.jpg" alt="Test">
          MS
        </Avatar>
      )
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByText('MS')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('invalid srcSet errors → shows fallback image, not children', async () => {
      renderWithTheme(
        <Avatar srcSet="invalid.jpg" fallback="/soroush.svg" alt="Test">
          MS
        </Avatar>
      )
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByRole('img')).toHaveAttribute('src', '/soroush.svg')
      expect(screen.queryByText('MS')).not.toBeInTheDocument()
    })

    it('valid srcSet loads — no fallback or children shown', () => {
      renderWithTheme(
        <Avatar srcSet="/soroush.svg" fallback="fallback.jpg" alt="Test">
          MS
        </Avatar>
      )
      expect(screen.getByRole('img')).toHaveAttribute('srcset', '/soroush.svg')
      expect(screen.queryByText('MS')).not.toBeInTheDocument()
    })

    it('invalid src + valid srcSet + invalid fallback → srcSet skipped, children shown after both errors', async () => {
      renderWithTheme(
        <Avatar src="invalid.jpg" srcSet="/soroush.svg" fallback="invalid-fallback.jpg" alt="Test">
          MS
        </Avatar>
      )

      // initial render uses src, not srcSet
      expect(screen.getByRole('img')).toHaveAttribute('src', 'invalid.jpg')

      // src errors → jumps to fallback, not srcSet
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByRole('img')).toHaveAttribute('src', 'invalid-fallback.jpg')

      // fallback also errors → children shown
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByText('MS')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('fallback-only errors → shows children after one error', async () => {
      renderWithTheme(
        <Avatar fallback="invalid-fallback.jpg" alt="Test">
          MS
        </Avatar>
      )
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByText('MS')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('resets error state when srcSet changes — retries new URL', async () => {
      const { rerender } = renderWithTheme(
        <Avatar srcSet="broken.jpg" alt="Test">
          MS
        </Avatar>
      )
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByText('MS')).toBeInTheDocument()

      await act(async () => {
        rerender(
          <Avatar srcSet="/soroush.svg" alt="Test">
            MS
          </Avatar>
        )
      })
      expect(screen.getByRole('img')).toHaveAttribute('srcset', '/soroush.svg')
      expect(screen.queryByText('MS')).not.toBeInTheDocument()
    })

    it('resets error state when fallback changes — retries new URL', async () => {
      const { rerender } = renderWithTheme(
        <Avatar fallback="broken-fallback.jpg" alt="Test">
          MS
        </Avatar>
      )
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByText('MS')).toBeInTheDocument()

      await act(async () => {
        rerender(
          <Avatar fallback="/soroush.svg" alt="Test">
            MS
          </Avatar>
        )
      })
      expect(screen.getByRole('img')).toHaveAttribute('src', '/soroush.svg')
      expect(screen.queryByText('MS')).not.toBeInTheDocument()
    })

    it('resets error state when src changes — retries new URL', async () => {
      const { rerender } = renderWithTheme(
        <Avatar src="broken.jpg" alt="Test">
          MS
        </Avatar>
      )
      fireEvent.error(screen.getByRole('img'))
      expect(await screen.findByText('MS')).toBeInTheDocument()

      await act(async () => {
        rerender(
          <Avatar src="/soroush.svg" alt="Test">
            MS
          </Avatar>
        )
      })
      expect(await screen.findByRole('img')).toHaveAttribute('src', '/soroush.svg')
      expect(screen.queryByText('MS')).not.toBeInTheDocument()
    })
  })

  describe('variant shapes', () => {
    it('circular variant applies 50% border radius', () => {
      renderWithTheme(<Avatar variant="circular" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ borderRadius: '50%' })
    })

    it('rounded variant applies theme.radii.md border radius (8px)', () => {
      renderWithTheme(<Avatar variant="rounded" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ borderRadius: '8px' })
    })

    it('square variant applies no border radius', () => {
      renderWithTheme(<Avatar variant="square" data-testid="avatar" />)
      const el = screen.getByTestId('avatar')
      expect(el).not.toHaveStyle({ borderRadius: '50%' })
      expect(el).not.toHaveStyle({ borderRadius: '8px' })
    })

    it('defaults to circular variant', () => {
      renderWithTheme(<Avatar data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ borderRadius: '50%' })
    })
  })

  describe('sizes', () => {
    it('sm applies 32px width and height', () => {
      renderWithTheme(<Avatar size="sm" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ width: '32px', height: '32px' })
    })

    it('md applies 40px width and height', () => {
      renderWithTheme(<Avatar size="md" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ width: '40px', height: '40px' })
    })

    it('lg applies 48px width and height', () => {
      renderWithTheme(<Avatar size="lg" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ width: '48px', height: '48px' })
    })

    it('defaults to md (40px)', () => {
      renderWithTheme(<Avatar data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ width: '40px', height: '40px' })
    })

    it('xl applies 56px width and height', () => {
      renderWithTheme(<Avatar size="xl" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ width: '56px', height: '56px' })
    })
  })

  describe('ring', () => {
    it('ring prop applies solid outline with default width and offset', () => {
      renderWithTheme(<Avatar ring data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({
        outlineStyle: 'solid',
        outlineWidth: '1px',
        outlineOffset: '2px',
      })
    })

    it('does not apply outline when ring is omitted', () => {
      renderWithTheme(<Avatar data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).not.toHaveStyle({ outlineStyle: 'solid' })
    })

    it('ringWidth overrides the default outline width', () => {
      renderWithTheme(<Avatar ring ringWidth="thick" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ outlineWidth: '4px' })
    })

    it('ringWidth="base" applies 2px outline width', () => {
      renderWithTheme(<Avatar ring ringWidth="base" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ outlineWidth: '2px' })
    })

    it('ringWidth="none" applies 0 outline width', () => {
      renderWithTheme(<Avatar ring ringWidth="none" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ outlineWidth: '0' })
    })

    it('ringColor applies the correct outline color from theme.border', () => {
      renderWithTheme(<Avatar ring ringColor="primary" data-testid="avatar" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ outlineColor: '#00FC40' })
    })
  })
})
