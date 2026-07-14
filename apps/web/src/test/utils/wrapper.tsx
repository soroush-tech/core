/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { ThemeProvider } from '@soroush.tech/design-system/ThemeProvider'

export const queryClient = new QueryClient()

const QueryWrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const AppWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <QueryWrapper>{children}</QueryWrapper>
  </ThemeProvider>
)

// Raw component exports — for renderHook({ wrapper })
export const wrapper = AppWrapper

export const queryWrapperWithSuspense = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <AppWrapper>{children}</AppWrapper>
  </Suspense>
)

// Render helpers — for component tests
export const renderWithTheme = (ui: ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: ThemeProvider, ...options })

export const renderWithApp = (ui: ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: AppWrapper, ...options })
