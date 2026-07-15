import { screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { useThemeMode } from 'src/theme/useThemeMode'
import { ColorCard } from './ColorCard'

vi.mock('src/theme/useThemeMode', async (importOriginal) => {
  const actual = await importOriginal<typeof import('src/theme/useThemeMode')>()
  return { ...actual, useThemeMode: vi.fn(() => ({ isDark: true, toggleTheme: vi.fn() })) }
})

describe('ColorCard', () => {
  it('renders the card title', () => {
    renderWithTheme(<ColorCard />)
    expect(screen.getByText('COLOR_SYSTEM')).toBeInTheDocument()
  })

  it('renders Primary and Default palette names in dark mode', () => {
    renderWithTheme(<ColorCard />)
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Default')).toBeInTheDocument()
  })

  it('renders Primary and Default palette names in light mode', () => {
    vi.mocked(useThemeMode).mockReturnValueOnce({ isDark: false, toggleTheme: vi.fn() })
    renderWithTheme(<ColorCard />)
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByText('Default')).toBeInTheDocument()
  })
})
