import { screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { CircularProgressCard } from './CircularProgressCard'

describe('CircularProgressCard', () => {
  it('renders the card title', () => {
    renderWithTheme(<CircularProgressCard />)
    expect(screen.getByText('CIRCULAR_PROGRESS')).toBeInTheDocument()
  })

  it('renders all easing variant labels', () => {
    renderWithTheme(<CircularProgressCard />)
    // Each easing appears in both indeterminate and determinate rows
    expect(screen.getAllByText('linear')).toHaveLength(2)
    expect(screen.getAllByText('ease')).toHaveLength(2)
    expect(screen.getAllByText('ease-in')).toHaveLength(2)
    expect(screen.getAllByText('ease-out')).toHaveLength(2)
    expect(screen.getAllByText('ease-in-out')).toHaveLength(2)
  })

  describe('step animation', () => {
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

    it('starts at 0%', () => {
      renderWithTheme(<CircularProgressCard />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('sets start on the first frame and shows 0%', () => {
      renderWithTheme(<CircularProgressCard />)
      tick(1000) // first frame - start = 1000, elapsed = 0
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('computes value from elapsed time (50% at halfway through duration)', () => {
      renderWithTheme(<CircularProgressCard />)
      tick(0) // start = 0
      tick(5000) // elapsed = 5000ms → 50%
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('wraps back to 0% at the full 10s duration boundary', () => {
      renderWithTheme(<CircularProgressCard />)
      tick(0) // start = 0
      tick(10000) // elapsed = 10000 % 10000 = 0 → 0%
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('advances correctly across multiple frames', () => {
      renderWithTheme(<CircularProgressCard />)
      tick(0) // start = 0
      tick(1000) // 10%
      expect(screen.getByText('10%')).toBeInTheDocument()
      tick(2500) // 25%
      expect(screen.getByText('25%')).toBeInTheDocument()
    })

    it('schedules a new animation frame after each step', () => {
      renderWithTheme(<CircularProgressCard />)
      const before = rafCallbacks.length
      tick(0)
      expect(rafCallbacks).toHaveLength(before + 1)
    })

    it('cancels the animation frame on unmount', () => {
      const { unmount } = renderWithTheme(<CircularProgressCard />)
      unmount()
      expect(cancelMock).toHaveBeenCalled()
    })
  })
})
