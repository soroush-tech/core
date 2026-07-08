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

    it('keeps the buffer 20 ahead of the value', () => {
      renderWithTheme(<LinearProgressCard />)
      tick(0)
      tick(5000)
      expect(screen.getByText('BUFFER_50/70')).toBeInTheDocument()
    })

    it('caps the buffer at 100 near the end of the loop', () => {
      renderWithTheme(<LinearProgressCard />)
      tick(0)
      tick(9000) // 90% → buffer clamps to 100
      expect(screen.getByText('BUFFER_90/100')).toBeInTheDocument()
    })

    it('wraps back to 0% at the full 10s duration boundary', () => {
      renderWithTheme(<LinearProgressCard />)
      tick(0)
      tick(10000) // elapsed = 10000 % 10000 = 0 → 0%
      expect(screen.getByText('DETERMINATE_0%')).toBeInTheDocument()
    })

    it('cancels the animation frame on unmount', () => {
      const { unmount } = renderWithTheme(<LinearProgressCard />)
      unmount()
      expect(cancelMock).toHaveBeenCalled()
    })
  })
})
