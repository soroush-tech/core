import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../theme/themes'
import { LinearProgress } from '../LinearProgress'

describe('LinearProgress', () => {
  // ─── element ─────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders a span with role="progressbar"', () => {
      renderWithTheme(<LinearProgress />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByRole('progressbar').tagName.toLowerCase()).toBe('span')
    })

    it('renders a track and two bars for the default (indeterminate) variant', () => {
      renderWithTheme(<LinearProgress data-testid="lp" />)
      expect(screen.getByTestId('lp').children).toHaveLength(3)
    })
  })

  // ─── variant ─────────────────────────────────────────────────────────────────

  describe('variant', () => {
    it('indeterminate (default) — produces a different root class than query', () => {
      const { rerender } = renderWithTheme(
        <LinearProgress variant="indeterminate" data-testid="lp" />
      )
      const indClass = screen.getByTestId('lp').getAttribute('class')
      rerender(<LinearProgress variant="query" data-testid="lp" />)
      expect(screen.getByTestId('lp').getAttribute('class')).not.toBe(indClass)
    })

    it('does not forward variant to DOM', () => {
      renderWithTheme(<LinearProgress data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveAttribute('variant')
    })
  })

  // ─── determinate ─────────────────────────────────────────────────────────────

  describe('determinate', () => {
    it('renders a single bar over the track', () => {
      renderWithTheme(<LinearProgress variant="determinate" value={50} data-testid="lp" />)
      expect(screen.getByTestId('lp').children).toHaveLength(2)
    })

    it('translates the bar according to value', () => {
      renderWithTheme(<LinearProgress variant="determinate" value={50} data-testid="lp" />)
      const bar = screen.getByTestId('lp').children[1]
      expect(bar).toHaveStyle({ transform: 'translateX(-50%)' })
    })

    it('clamps value below min to min (fully hidden bar)', () => {
      renderWithTheme(
        <LinearProgress variant="determinate" value={-20} min={0} max={100} data-testid="lp" />
      )
      const bar = screen.getByTestId('lp').children[1]
      expect(bar).toHaveStyle({ transform: 'translateX(-100%)' })
    })

    it('clamps value above max to max (fully visible bar)', () => {
      renderWithTheme(
        <LinearProgress variant="determinate" value={200} min={0} max={100} data-testid="lp" />
      )
      const bar = screen.getByTestId('lp').children[1]
      expect(bar).toHaveStyle({ transform: 'translateX(0%)' })
    })

    it('sets aria-valuenow, aria-valuemin, aria-valuemax', () => {
      renderWithTheme(
        <LinearProgress variant="determinate" value={75} min={0} max={100} data-testid="lp" />
      )
      const el = screen.getByTestId('lp')
      expect(el).toHaveAttribute('aria-valuenow', '75')
      expect(el).toHaveAttribute('aria-valuemin', '0')
      expect(el).toHaveAttribute('aria-valuemax', '100')
    })

    it('guards against max=0 — no NaN transform, clamped aria-valuenow', () => {
      renderWithTheme(
        <LinearProgress variant="determinate" value={50} min={0} max={0} data-testid="lp" />
      )
      const bar = screen.getByTestId('lp').children[1]
      expect(bar).toHaveStyle({ transform: 'translateX(-100%)' })
      expect(screen.getByTestId('lp')).toHaveAttribute('aria-valuenow', '0')
    })
  })

  // ─── buffer ──────────────────────────────────────────────────────────────────

  describe('buffer', () => {
    it('renders a dashed leading edge and two bars', () => {
      renderWithTheme(
        <LinearProgress variant="determinate" buffer value={30} valueBuffer={60} data-testid="lp" />
      )
      const children = screen.getByTestId('lp').children
      expect(children).toHaveLength(3)
      expect(children[0]).toHaveStyle({ backgroundSize: '10px 10px' })
    })

    it('translates the buffer bar according to valueBuffer and the primary bar according to value', () => {
      renderWithTheme(
        <LinearProgress variant="determinate" buffer value={30} valueBuffer={60} data-testid="lp" />
      )
      const children = screen.getByTestId('lp').children
      expect(children[1]).toHaveStyle({ transform: 'translateX(-40%)' })
      expect(children[2]).toHaveStyle({ transform: 'translateX(-70%)' })
    })

    it('clamps valueBuffer between min and max', () => {
      renderWithTheme(
        <LinearProgress
          variant="determinate"
          buffer
          value={30}
          valueBuffer={250}
          max={100}
          data-testid="lp"
        />
      )
      const bufferBar = screen.getByTestId('lp').children[1]
      expect(bufferBar).toHaveStyle({ transform: 'translateX(0%)' })
    })

    it('has no effect on the indeterminate variant', () => {
      renderWithTheme(<LinearProgress variant="indeterminate" buffer data-testid="lp" />)
      const children = screen.getByTestId('lp').children
      expect(children).toHaveLength(3)
      expect(children[0]).not.toHaveStyle({ backgroundSize: '10px 10px' })
    })

    it('sets aria-valuenow from value', () => {
      renderWithTheme(
        <LinearProgress variant="determinate" buffer value={30} valueBuffer={60} data-testid="lp" />
      )
      expect(screen.getByTestId('lp')).toHaveAttribute('aria-valuenow', '30')
    })

    it('does not forward buffer or valueBuffer to DOM', () => {
      renderWithTheme(
        <LinearProgress variant="determinate" buffer value={30} valueBuffer={60} data-testid="lp" />
      )
      const el = screen.getByTestId('lp')
      expect(el).not.toHaveAttribute('buffer')
      expect(el).not.toHaveAttribute('valueBuffer')
    })
  })

  // ─── indeterminate / query ───────────────────────────────────────────────────

  describe('indeterminate and query', () => {
    it('indeterminate does not set aria-valuenow', () => {
      renderWithTheme(<LinearProgress data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveAttribute('aria-valuenow')
    })

    it('query does not set aria-valuenow', () => {
      renderWithTheme(<LinearProgress variant="query" data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveAttribute('aria-valuenow')
    })

    it('query flips the root with rotate(180deg)', () => {
      renderWithTheme(<LinearProgress variant="query" data-testid="lp" />)
      expect(screen.getByTestId('lp')).toHaveStyle({ transform: 'rotate(180deg)' })
    })
  })

  // ─── spinning ────────────────────────────────────────────────────────────────

  describe('spinning', () => {
    it('determinate + spinning — renders two travelling segments sized by value', () => {
      renderWithTheme(<LinearProgress variant="determinate" value={50} spinning data-testid="lp" />)
      const traveler = screen.getByTestId('lp').children[1]
      expect(traveler.children).toHaveLength(2)
      expect(traveler.children[0]).toHaveStyle({ width: '50%' })
      expect(traveler.children[1]).toHaveStyle({ width: '50%' })
    })

    it('offsets the wrap-around copy one full track width behind', () => {
      renderWithTheme(<LinearProgress variant="determinate" value={30} spinning data-testid="lp" />)
      const traveler = screen.getByTestId('lp').children[1]
      expect(traveler.children[1]).toHaveStyle({ left: '-100%' })
    })

    it('renders the plain anchored bar when spinning is off', () => {
      renderWithTheme(<LinearProgress variant="determinate" value={50} data-testid="lp" />)
      const bar = screen.getByTestId('lp').children[1]
      expect(bar.children).toHaveLength(0)
      expect(bar).toHaveStyle({ transform: 'translateX(-50%)' })
    })

    it('has no effect on the indeterminate variant', () => {
      renderWithTheme(<LinearProgress variant="indeterminate" spinning data-testid="lp" />)
      const bar = screen.getByTestId('lp').children[2]
      expect(bar.children).toHaveLength(0)
    })

    it('does not forward spinning to DOM', () => {
      renderWithTheme(<LinearProgress spinning data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveAttribute('spinning')
    })
  })

  // ─── easing ──────────────────────────────────────────────────────────────────

  describe('easing', () => {
    it('changes the determinate bar class when easing changes', () => {
      const { rerender } = renderWithTheme(
        <LinearProgress variant="determinate" value={50} easing="linear" data-testid="lp" />
      )
      const linearClass = screen.getByTestId('lp').children[1].getAttribute('class')
      rerender(
        <LinearProgress variant="determinate" value={50} easing="ease-in-out" data-testid="lp" />
      )
      expect(screen.getByTestId('lp').children[1].getAttribute('class')).not.toBe(linearClass)
    })

    it('does not forward easing to DOM', () => {
      renderWithTheme(<LinearProgress easing="ease" data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveAttribute('easing')
    })
  })

  // ─── showTrack ───────────────────────────────────────────────────────────────

  describe('showTrack', () => {
    it('renders the track by default and hides it when false', () => {
      const { rerender } = renderWithTheme(
        <LinearProgress variant="determinate" value={50} data-testid="lp" />
      )
      expect(screen.getByTestId('lp').children).toHaveLength(2)
      rerender(
        <LinearProgress variant="determinate" value={50} showTrack={false} data-testid="lp" />
      )
      expect(screen.getByTestId('lp').children).toHaveLength(1)
    })

    it('hides the dashed edge in buffer mode when false', () => {
      renderWithTheme(
        <LinearProgress
          variant="determinate"
          buffer
          value={30}
          valueBuffer={60}
          showTrack={false}
          data-testid="lp"
        />
      )
      expect(screen.getByTestId('lp').children).toHaveLength(2)
    })

    it('does not forward showTrack to DOM', () => {
      renderWithTheme(<LinearProgress showTrack data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveAttribute('showTrack')
    })
  })

  // ─── color ───────────────────────────────────────────────────────────────────

  describe('color', () => {
    it('resolves theme.palette[color].main as CSS color on the root', () => {
      renderWithTheme(<LinearProgress color="primary" data-testid="lp" />)
      expect(screen.getByTestId('lp')).toHaveStyle({ color: baseTheme.palette.primary.main })
    })

    it('each color resolves to the correct theme token', () => {
      const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const
      colors.forEach((color) => {
        const { unmount } = renderWithTheme(<LinearProgress color={color} data-testid="lp" />)
        expect(screen.getByTestId('lp')).toHaveStyle({ color: baseTheme.palette[color].main })
        unmount()
      })
    })

    it('inherit — produces a different root class than primary', () => {
      const { rerender } = renderWithTheme(<LinearProgress color="primary" data-testid="lp" />)
      const primaryClass = screen.getByTestId('lp').getAttribute('class')
      rerender(<LinearProgress color="inherit" data-testid="lp" />)
      expect(screen.getByTestId('lp').getAttribute('class')).not.toBe(primaryClass)
    })

    it('does not forward color to DOM', () => {
      renderWithTheme(<LinearProgress color="primary" data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveAttribute('color')
    })
  })

  // ─── thickness ───────────────────────────────────────────────────────────────

  describe('thickness', () => {
    it('defaults to a 4px tall bar', () => {
      renderWithTheme(<LinearProgress data-testid="lp" />)
      expect(screen.getByTestId('lp')).toHaveStyle({ height: '4px' })
    })

    it('sets the bar height from a number', () => {
      renderWithTheme(<LinearProgress thickness={8} data-testid="lp" />)
      expect(screen.getByTestId('lp')).toHaveStyle({ height: '8px' })
    })

    it('accepts a raw CSS unit string', () => {
      renderWithTheme(<LinearProgress thickness="0.5rem" data-testid="lp" />)
      expect(screen.getByTestId('lp')).toHaveStyle({ height: '0.5rem' })
    })

    it('is overridden by the layout height prop', () => {
      renderWithTheme(<LinearProgress thickness={8} height={12} data-testid="lp" />)
      expect(screen.getByTestId('lp')).toHaveStyle({ height: '12px' })
    })

    it('does not forward thickness to DOM', () => {
      renderWithTheme(<LinearProgress thickness={8} data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveAttribute('thickness')
    })
  })

  // ─── round ───────────────────────────────────────────────────────────────────

  describe('round', () => {
    it('rounds the corners into a pill shape', () => {
      renderWithTheme(<LinearProgress round data-testid="lp" />)
      expect(screen.getByTestId('lp')).toHaveStyle({ borderRadius: '9999px' })
    })

    it('has square corners by default', () => {
      renderWithTheme(<LinearProgress data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveStyle({ borderRadius: '9999px' })
    })

    it('does not forward round to DOM', () => {
      renderWithTheme(<LinearProgress round data-testid="lp" />)
      expect(screen.getByTestId('lp')).not.toHaveAttribute('round')
    })
  })

  // ─── styled-system props ─────────────────────────────────────────────────────

  describe('styled-system props', () => {
    it('applies margin from the space scale', () => {
      renderWithTheme(<LinearProgress m={2} data-testid="lp" />)
      expect(screen.getByTestId('lp')).toHaveStyle({ margin: '16px' })
    })

    it('does not forward styled-system props to DOM', () => {
      renderWithTheme(<LinearProgress m={2} height={8} data-testid="lp" />)
      const el = screen.getByTestId('lp')
      expect(el).not.toHaveAttribute('m')
      expect(el).not.toHaveAttribute('height')
    })
  })

  // ─── HTML attribute passthrough ───────────────────────────────────────────────

  describe('HTML attribute passthrough', () => {
    it('forwards className', () => {
      renderWithTheme(<LinearProgress className="custom" data-testid="lp" />)
      expect(screen.getByTestId('lp')).toHaveClass('custom')
    })

    it('forwards data attributes', () => {
      renderWithTheme(<LinearProgress data-testid="my-progress" />)
      expect(screen.getByTestId('my-progress')).toBeInTheDocument()
    })

    it('has a default aria-label of "Loading"', () => {
      renderWithTheme(<LinearProgress />)
      expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument()
    })

    it('forwards aria-label', () => {
      renderWithTheme(<LinearProgress aria-label="uploading" />)
      expect(screen.getByRole('progressbar', { name: 'uploading' })).toBeInTheDocument()
    })
  })
})
