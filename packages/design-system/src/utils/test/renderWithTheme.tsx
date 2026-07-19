import type { ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@soroush.tech/design-system/theme'

// Render helper for component tests — wraps the UI in the design-system ThemeProvider.
export const renderWithTheme = (ui: ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: ThemeProvider, ...options })
