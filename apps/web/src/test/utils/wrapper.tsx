/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { dark } from 'src/theme/themes'

export const queryClient = new QueryClient()

const QueryWrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

// Tests render under the app's brand dark theme, mirroring the production default.
const BrandThemeProvider = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={dark}>{children}</ThemeProvider>
)

const AppWrapper = ({ children }: { children: ReactNode }) => (
  <BrandThemeProvider>
    <QueryWrapper>{children}</QueryWrapper>
  </BrandThemeProvider>
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
  render(ui, { wrapper: BrandThemeProvider, ...options })

export const renderWithApp = (ui: ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: AppWrapper, ...options })
