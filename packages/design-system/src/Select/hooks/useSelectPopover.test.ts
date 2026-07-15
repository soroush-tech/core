import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSelectPopover } from './useSelectPopover'

describe('useSelectPopover', () => {
  it('opens and closes in uncontrolled mode', () => {
    const { result } = renderHook(() => useSelectPopover({}))
    expect(result.current.open).toBe(false)

    act(() => result.current.openMenu())
    expect(result.current.open).toBe(true)

    act(() => result.current.closeMenu())
    expect(result.current.open).toBe(false)
  })

  it('respects defaultOpen and fires onOpen/onClose', () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const { result } = renderHook(() => useSelectPopover({ defaultOpen: true, onOpen, onClose }))

    expect(result.current.open).toBe(true)
    act(() => result.current.closeMenu())
    expect(onClose).toHaveBeenCalledOnce()
    act(() => result.current.openMenu())
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('does not toggle its own state when controlled, but still fires callbacks', () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const { result } = renderHook(() => useSelectPopover({ open: false, onOpen, onClose }))

    act(() => result.current.openMenu())
    expect(result.current.open).toBe(false)
    expect(onOpen).toHaveBeenCalledOnce()

    act(() => result.current.closeMenu())
    expect(onClose).toHaveBeenCalledOnce()
  })
})
