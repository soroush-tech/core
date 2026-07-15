import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeModeProvider } from 'src/theme/ThemeModeProvider'
import { GlobalStyles } from 'src/theme/GlobalStyles'
import queryClient from 'src/utils/api/queryClient'

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <GlobalStyles />
        {children}
      </ThemeModeProvider>
    </QueryClientProvider>
  )
}
