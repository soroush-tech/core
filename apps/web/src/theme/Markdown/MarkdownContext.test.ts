import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { MarkdownContext, useMarkdownContext, type MarkdownContextValue } from './MarkdownContext'

describe('useMarkdownContext', () => {
  it('throws when used outside <Markdown.Control>', () => {
    expect(() => renderHook(() => useMarkdownContext())).toThrow(/<Markdown.Control>/)
  })

  it('returns the provided context inside a provider', () => {
    const value: MarkdownContextValue = {
      value: 'hi',
      onChange: () => {},
      dispatch: () => {},
      rememberSelection: () => {},
      queueSelection: () => {},
      takeQueuedSelection: () => null,
    }
    const { result } = renderHook(() => useMarkdownContext(), {
      wrapper: ({ children }) => createElement(MarkdownContext.Provider, { value }, children),
    })
    expect(result.current.value).toBe('hi')
  })
})
