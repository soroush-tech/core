import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COPIED_RESET_MS, useCopyToClipboard } from './useCopyToClipboard'

const writeText = vi.fn()

beforeEach(() => {
  writeText.mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCopyToClipboard', () => {
  it('copies text, flips `copied`, then resets after the default delay', async () => {
    vi.useFakeTimers()
    try {
      const { result } = renderHook(() => useCopyToClipboard())
      expect(result.current.copied).toBe(false)

      await act(async () => {
        result.current.copy('hello')
      })
      expect(writeText).toHaveBeenCalledWith('hello')
      expect(result.current.copied).toBe(true)

      act(() => vi.advanceTimersByTime(COPIED_RESET_MS))
      expect(result.current.copied).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('honours a custom reset delay', async () => {
    vi.useFakeTimers()
    try {
      const { result } = renderHook(() => useCopyToClipboard(500))
      await act(async () => {
        result.current.copy('x')
      })
      expect(result.current.copied).toBe(true)

      act(() => vi.advanceTimersByTime(499))
      expect(result.current.copied).toBe(true)
      act(() => vi.advanceTimersByTime(1))
      expect(result.current.copied).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('does nothing when the clipboard API is unavailable', () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    const { result } = renderHook(() => useCopyToClipboard())
    act(() => result.current.copy('x'))
    expect(result.current.copied).toBe(false)
    expect(writeText).not.toHaveBeenCalled()
  })

  it('stays idle when the clipboard write is rejected', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => {
      result.current.copy('x')
    })
    expect(result.current.copied).toBe(false)
  })
})
