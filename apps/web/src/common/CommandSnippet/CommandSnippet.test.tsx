import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { COPIED_RESET_MS } from '@soroush.tech/design-system/hooks/useCopyToClipboard'
import { CommandSnippet } from './CommandSnippet'

const writeText = vi.fn()

beforeEach(() => {
  writeText.mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('CommandSnippet', () => {
  it('renders the command after a shell prompt', () => {
    renderWithTheme(<CommandSnippet command="npm i pkg" />)
    expect(screen.getByText('npm i pkg')).toBeInTheDocument()
  })

  it('starts in the idle copy state', () => {
    renderWithTheme(<CommandSnippet command="npm i pkg" />)
    expect(screen.getByRole('button', { name: 'Copy command' })).toBeInTheDocument()
  })

  it('copies the command, confirms, then reverts after the reset delay', async () => {
    vi.useFakeTimers()
    try {
      renderWithTheme(<CommandSnippet command="npm i pkg" />)

      fireEvent.click(screen.getByRole('button', { name: 'Copy command' }))
      expect(writeText).toHaveBeenCalledWith('npm i pkg')

      // Flush the clipboard promise so the confirmation state applies.
      await act(async () => {})
      expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()

      act(() => vi.advanceTimersByTime(COPIED_RESET_MS))
      expect(screen.getByRole('button', { name: 'Copy command' })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('does nothing when the clipboard API is unavailable', () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    renderWithTheme(<CommandSnippet command="npm i pkg" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy command' }))
    expect(screen.getByRole('button', { name: 'Copy command' })).toBeInTheDocument()
  })

  it('stays idle when the clipboard write is rejected', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    renderWithTheme(<CommandSnippet command="npm i pkg" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy command' }))
    await act(async () => {})
    expect(screen.getByRole('button', { name: 'Copy command' })).toBeInTheDocument()
  })

  it('forwards passthrough props to the container', () => {
    renderWithTheme(<CommandSnippet command="npm i pkg" data-testid="snippet" />)
    expect(screen.getByTestId('snippet')).toBeInTheDocument()
  })
})
