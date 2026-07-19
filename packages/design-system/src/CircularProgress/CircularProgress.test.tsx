import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../theme/themes'
import { CircularProgress } from '../CircularProgress'

const VIEWBOX = 44
const THICKNESS_DEFAULT = 3.6
const r = (VIEWBOX - THICKNESS_DEFAULT * 2) / 2
const circumference = 2 * Math.PI * r

describe('CircularProgress', () => {
  // ─── element ─────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders a span with role="progressbar"', () => {
      renderWithTheme(<CircularProgress />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByRole('progressbar').tagName.toLowerCase()).toBe('span')
    })

    it('renders a circle inside the svg', () => {
      const { container } = renderWithTheme(<CircularProgress />)
      expect(container.querySelector('circle')).toBeInTheDocument()
    })
  })

  // ─── variant ─────────────────────────────────────────────────────────────────

  describe('variant', () => {
    it('indeterminate (default) — produces a different root class than determinate', () => {
      const { rerender } = renderWithTheme(
        <CircularProgress variant="indeterminate" data-testid="cp" />
      )
      const indClass = screen.getByTestId('cp').getAttribute('class')
      rerender(<CircularProgress variant="determinate" value={0} data-testid="cp" />)
      expect(screen.getByTestId('cp').getAttribute('class')).not.toBe(indClass)
    })

    it('does not forward variant to DOM', () => {
      renderWithTheme(<CircularProgress data-testid="cp" />)
      expect(screen.getByTestId('cp')).not.toHaveAttribute('variant')
    })
  })

  // ─── determinate ─────────────────────────────────────────────────────────────

  describe('determinate', () => {
    it('sets stroke-dasharray and stroke-dashoffset on the circle', () => {
      const { container } = renderWithTheme(<CircularProgress variant="determinate" value={50} />)
      const circle = container.querySelector('circle')
      expect(circle).toHaveStyle({
        strokeDasharray: `${circumference}px`,
        strokeDashoffset: `${circumference * 0.5}px`,
      })
    })

    it('clamps value below min to min (0% offset)', () => {
      const { container } = renderWithTheme(
        <CircularProgress variant="determinate" value={-20} min={0} max={100} />
      )
      const circle = container.querySelector('circle')
      expect(circle).toHaveStyle({ strokeDashoffset: `${circumference}px` })
    })

    it('clamps value above max to max (0 offset)', () => {
      const { container } = renderWithTheme(
        <CircularProgress variant="determinate" value={200} min={0} max={100} />
      )
      const circle = container.querySelector('circle')
      expect(circle).toHaveStyle({ strokeDashoffset: '0px' })
    })

    it('sets aria-valuenow, aria-valuemin, aria-valuemax', () => {
      renderWithTheme(
        <CircularProgress variant="determinate" value={75} min={0} max={100} data-testid="cp" />
      )
      const el = screen.getByTestId('cp')
      expect(el).toHaveAttribute('aria-valuenow', '75')
      expect(el).toHaveAttribute('aria-valuemin', '0')
      expect(el).toHaveAttribute('aria-valuemax', '100')
    })
  })

  // ─── indeterminate ───────────────────────────────────────────────────────────

  describe('indeterminate', () => {
    it('does not set aria-valuenow', () => {
      renderWithTheme(<CircularProgress data-testid="cp" />)
      expect(screen.getByTestId('cp')).not.toHaveAttribute('aria-valuenow')
    })

    it('disableShrink — changes circle class (suppresses dash animation)', () => {
      const { container, rerender } = renderWithTheme(<CircularProgress disableShrink={false} />)
      const withShrink = container.querySelector('circle')!.getAttribute('class')
      rerender(<CircularProgress disableShrink={true} />)
      expect(container.querySelector('circle')!.getAttribute('class')).not.toBe(withShrink)
    })

    it('does not forward disableShrink to DOM', () => {
      const { container } = renderWithTheme(<CircularProgress disableShrink />)
      expect(container.querySelector('circle')).not.toHaveAttribute('disableShrink')
    })
  })

  // ─── spinning ─────────────────────────────────────────────────────────────────

  describe('spinning', () => {
    it('determinate + spinning — changes class compared to non-spinning determinate', () => {
      const { rerender } = renderWithTheme(
        <CircularProgress variant="determinate" value={75} data-testid="cp" />
      )
      const noSpinClass = screen.getByTestId('cp').getAttribute('class')
      rerender(<CircularProgress variant="determinate" value={75} spinning data-testid="cp" />)
      expect(screen.getByTestId('cp').getAttribute('class')).not.toBe(noSpinClass)
    })

    it('determinate + spinning still shows the arc at correct length', () => {
      const { container } = renderWithTheme(
        <CircularProgress variant="determinate" value={50} spinning />
      )
      const circle = container.querySelector('circle')
      expect(circle).toHaveStyle({ strokeDashoffset: `${circumference * 0.5}px` })
    })

    it('does not forward spinning to DOM', () => {
      renderWithTheme(<CircularProgress spinning data-testid="cp" />)
      expect(screen.getByTestId('cp')).not.toHaveAttribute('spinning')
    })
  })

  // ─── showTrack ────────────────────────────────────────────────────────────────

  describe('showTrack', () => {
    it('renders a second circle when showTrack=true', () => {
      const { container } = renderWithTheme(<CircularProgress showTrack />)
      expect(container.querySelectorAll('circle')).toHaveLength(2)
    })

    it('renders only one circle by default', () => {
      const { container } = renderWithTheme(<CircularProgress />)
      expect(container.querySelectorAll('circle')).toHaveLength(1)
    })

    it('track circle has reduced opacity', () => {
      const { container } = renderWithTheme(<CircularProgress showTrack />)
      const track = container.querySelectorAll('circle')[0]
      expect(track).toHaveStyle({ opacity: '0.2' })
    })

    it('does not forward showTrack to DOM', () => {
      renderWithTheme(<CircularProgress showTrack data-testid="cp" />)
      expect(screen.getByTestId('cp')).not.toHaveAttribute('showTrack')
    })
  })

  // ─── easing ──────────────────────────────────────────────────────────────────

  describe('easing', () => {
    it('changes root class when easing changes', () => {
      const { rerender } = renderWithTheme(<CircularProgress easing="linear" data-testid="cp" />)
      const linearClass = screen.getByTestId('cp').getAttribute('class')
      rerender(<CircularProgress easing="ease-in-out" data-testid="cp" />)
      expect(screen.getByTestId('cp').getAttribute('class')).not.toBe(linearClass)
    })

    it('does not forward easing to DOM', () => {
      renderWithTheme(<CircularProgress easing="ease" data-testid="cp" />)
      expect(screen.getByTestId('cp')).not.toHaveAttribute('easing')
    })
  })

  // ─── color ───────────────────────────────────────────────────────────────────

  describe('color', () => {
    it('resolves theme.palette[color].main as CSS color on the root', () => {
      renderWithTheme(<CircularProgress color="primary" data-testid="cp" />)
      expect(screen.getByTestId('cp')).toHaveStyle({ color: baseTheme.palette.primary.main })
    })

    it('each color resolves to the correct theme token', () => {
      const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const
      colors.forEach((color) => {
        const { unmount } = renderWithTheme(<CircularProgress color={color} data-testid="cp" />)
        expect(screen.getByTestId('cp')).toHaveStyle({ color: baseTheme.palette[color].main })
        unmount()
      })
    })

    it('inherit — produces a different root class than primary', () => {
      const { rerender } = renderWithTheme(<CircularProgress color="primary" data-testid="cp" />)
      const primaryClass = screen.getByTestId('cp').getAttribute('class')
      rerender(<CircularProgress color="inherit" data-testid="cp" />)
      expect(screen.getByTestId('cp').getAttribute('class')).not.toBe(primaryClass)
    })

    it('does not forward color to DOM', () => {
      renderWithTheme(<CircularProgress color="primary" data-testid="cp" />)
      expect(screen.getByTestId('cp')).not.toHaveAttribute('color')
    })
  })

  // ─── size ────────────────────────────────────────────────────────────────────

  describe('size', () => {
    it('changes root class when size changes', () => {
      const { rerender } = renderWithTheme(<CircularProgress size={40} data-testid="cp" />)
      const cls40 = screen.getByTestId('cp').getAttribute('class')
      rerender(<CircularProgress size={80} data-testid="cp" />)
      expect(screen.getByTestId('cp').getAttribute('class')).not.toBe(cls40)
    })

    it('does not forward size to DOM', () => {
      renderWithTheme(<CircularProgress size={40} data-testid="cp" />)
      expect(screen.getByTestId('cp')).not.toHaveAttribute('size')
    })
  })

  // ─── thickness ───────────────────────────────────────────────────────────────

  describe('thickness', () => {
    it('sets stroke-width attribute on the circle', () => {
      const { container } = renderWithTheme(<CircularProgress thickness={6} />)
      expect(container.querySelector('circle')).toHaveAttribute('stroke-width', '6')
    })

    it('does not forward thickness to DOM', () => {
      const { container } = renderWithTheme(<CircularProgress thickness={6} />)
      expect(container.querySelector('circle')).not.toHaveAttribute('thickness')
    })
  })

  // ─── HTML attribute passthrough ───────────────────────────────────────────────

  describe('HTML attribute passthrough', () => {
    it('forwards className', () => {
      renderWithTheme(<CircularProgress className="custom" data-testid="cp" />)
      expect(screen.getByTestId('cp')).toHaveClass('custom')
    })

    it('forwards data attributes', () => {
      renderWithTheme(<CircularProgress data-testid="my-spinner" />)
      expect(screen.getByTestId('my-spinner')).toBeInTheDocument()
    })

    it('has a default aria-label of "Loading"', () => {
      renderWithTheme(<CircularProgress />)
      expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument()
    })

    it('forwards aria-label', () => {
      renderWithTheme(<CircularProgress aria-label="uploading" />)
      expect(screen.getByRole('progressbar', { name: 'uploading' })).toBeInTheDocument()
    })
  })
})
