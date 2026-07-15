import { describe, it, expect, vi } from 'vitest'
import { createRef } from 'react'
import { renderHook } from '@testing-library/react'
import { useMergedRefs } from './useMergedRefs'

describe('useMergedRefs', () => {
  it('returns null when both refs are absent', () => {
    const { result } = renderHook(() => useMergedRefs(null, undefined))
    expect(result.current).toBeNull()
  })

  it('assigns the value to a function ref and an object ref', () => {
    const fnRef = vi.fn()
    const objRef = createRef<HTMLDivElement>()
    const node = document.createElement('div')

    const { result } = renderHook(() => useMergedRefs<HTMLDivElement>(fnRef, objRef))
    result.current?.(node)

    expect(fnRef).toHaveBeenCalledWith(node)
    expect(objRef.current).toBe(node)
  })

  it('skips an absent ref while still assigning the present one', () => {
    const objRef = createRef<HTMLDivElement>()
    const node = document.createElement('div')

    const { result } = renderHook(() => useMergedRefs<HTMLDivElement>(objRef, null))
    result.current?.(node)

    expect(objRef.current).toBe(node)
  })

  it('keeps a stable identity while the refs are unchanged', () => {
    const fnRef = vi.fn()
    const objRef = createRef<HTMLDivElement>()
    const { result, rerender } = renderHook(() => useMergedRefs<HTMLDivElement>(fnRef, objRef))
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})
