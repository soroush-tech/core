import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEventCallback } from './useEventCallback'

describe('useEventCallback', () => {
  it('keeps a stable identity across renders', () => {
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: () => 1 },
    })
    const first = result.current
    rerender({ fn: () => 2 })
    expect(result.current).toBe(first)
  })

  it('always invokes the latest callback', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: first },
    })
    rerender({ fn: second })
    result.current()
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  it('forwards arguments and returns the callback result', () => {
    const { result } = renderHook(() => useEventCallback((a: number, b: number) => a + b))
    expect(result.current(2, 3)).toBe(5)
  })
})
