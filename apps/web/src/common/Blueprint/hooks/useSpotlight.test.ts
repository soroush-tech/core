import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useSpotlight } from './useSpotlight'

describe('useSpotlight', () => {
  it('returns a ref initialised to null', () => {
    const { result } = renderHook(() => useSpotlight())
    expect(result.current).toEqual({ current: null })
  })

  it('writes the cursor position to CSS custom properties on mouse move', () => {
    const { result } = renderHook(() => useSpotlight())
    const element = document.createElement('div')
    result.current.current = element

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 240 }))

    expect(element.style.getPropertyValue('--spotlight-x')).toBe('120px')
    expect(element.style.getPropertyValue('--spotlight-y')).toBe('240px')
  })

  it('ignores mouse moves while the element is not mounted', () => {
    renderHook(() => useSpotlight())
    expect(() =>
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 1 }))
    ).not.toThrow()
  })

  it('removes the listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useSpotlight())

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
  })
})
