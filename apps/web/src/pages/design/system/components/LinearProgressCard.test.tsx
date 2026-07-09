import { screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { LinearProgressCard } from './LinearProgressCard'

describe('LinearProgressCard', () => {
  it('renders the card title', () => {
    renderWithTheme(<LinearProgressCard />)
    expect(screen.getByText('LINEAR_PROGRESS')).toBeInTheDocument()
  })

  it('renders every demo label with its progressbar', () => {
    renderWithTheme(<LinearProgressCard />)
    expect(screen.getByText('INDETERMINATE')).toBeInTheDocument()
    expect(screen.getByText('QUERY')).toBeInTheDocument()
    expect(screen.getByText('DETERMINATE_0%')).toBeInTheDocument()
    expect(screen.getByText('BUFFER_0/20')).toBeInTheDocument()
    expect(screen.getByText('ROUND_THICK_SPIN')).toBeInTheDocument()
    expect(screen.getAllByRole('progressbar')).toHaveLength(5)
  })

  describe('value loop', () => {
    let rafCallbacks: Array<(timestamp: number) => void>
    let cancelMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
      rafCallbacks = []
      cancelMock = vi.fn()
      vi.stubGlobal('requestAnimationFrame', (cb: (timestamp: number) => void) => {
        rafCallbacks.push(cb)
        return rafCallbacks.length - 1
      })
      vi.stubGlobal('cancelAnimationFrame', cancelMock)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    const tick = (timestamp: number) =>
      act(() => {
        rafCallbacks[rafCallbacks.length - 1](timestamp)
      })

    it('drives the determinate and spinning bars from elapsed time', () => {
      renderWithTheme(<LinearProgressCard />)
      tick(0) // start = 0
      tick(5000) // elapsed = 5000ms → 50%
      expect(screen.getByText('DETERMINATE_50%')).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: 'determinate demo' })).toHaveAttribute(
        'aria-valuenow',
        '50'
      )
      expect(screen.getByRole('progressbar', { name: 'round-thick-spin demo' })).toHaveAttribute(
        'aria-valuenow',
        '50'
      )
    })

    it.each([
      [5000, 'BUFFER_50/70'], // buffer stays 20 ahead of the value
      [9000, 'BUFFER_90/100'], // buffer clamps to 100 near the end
      [10000, 'DETERMINATE_0%'], // wraps back to 0% at the 10s boundary
    ])('reflects %ims of elapsed time in the loop', (elapsed, expected) => {
      renderWithTheme(<LinearProgressCard />)
      tick(0)
      tick(elapsed)
      expect(screen.getByText(expected)).toBeInTheDocument()
    })

    it('cancels the animation frame on unmount', () => {
      const { unmount } = renderWithTheme(<LinearProgressCard />)
      unmount()
      expect(cancelMock).toHaveBeenCalled()
    })
  })
})
