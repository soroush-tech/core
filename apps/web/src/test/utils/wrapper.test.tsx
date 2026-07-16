import { screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@soroush.tech/design-system'
import { describe, it, expect } from 'vitest'
import {
  queryClient,
  wrapper,
  queryWrapperWithSuspense,
  renderWithTheme,
  renderWithApp,
} from './wrapper'

describe('wrapper', () => {
  it('queryClient is a QueryClient instance', () => {
    expect(queryClient).toHaveProperty('getQueryCache')
    expect(queryClient).toHaveProperty('fetchQuery')
  })

  it('renderWithTheme provides a theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper })
    expect(result.current).toHaveProperty('palette')
  })

  it('renderWithTheme renders children', () => {
    renderWithTheme(<span data-testid="child">hello</span>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renderWithApp renders children', () => {
    renderWithApp(<span data-testid="app-child">world</span>)
    expect(screen.getByTestId('app-child')).toBeInTheDocument()
  })

  it('renderWithApp provides a QueryClient', () => {
    const { result } = renderHook(() => useQueryClient(), { wrapper })
    expect(result.current).toBeDefined()
  })

  it('queryWrapperWithSuspense renders children', () => {
    const Wrapped = queryWrapperWithSuspense
    renderWithTheme(
      <Wrapped>
        <span data-testid="suspense-child">ok</span>
      </Wrapped>
    )
    expect(screen.getByTestId('suspense-child')).toBeInTheDocument()
  })
})
