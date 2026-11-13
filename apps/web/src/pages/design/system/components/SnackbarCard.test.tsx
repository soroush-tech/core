import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { SnackbarCard } from './SnackbarCard'

// Longer than the Grow transition, far shorter than the 4s auto-hide.
const TRANSITION_MS = 500

const elapse = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

const open = () => {
  fireEvent.click(screen.getByRole('button', { name: 'SHOW_SNACKBAR' }))
  elapse(TRANSITION_MS)
}

describe('SnackbarCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders closed until triggered', () => {
    renderWithTheme(<SnackbarCard />)
    expect(screen.getByText('SNACKBAR')).toBeInTheDocument()
    expect(screen.queryByText('CHANGES_SAVED')).not.toBeInTheDocument()
    open()
    expect(screen.getByRole('status')).toHaveTextContent('CHANGES_SAVED')
  })

  it('closes from its dismiss action', () => {
    renderWithTheme(<SnackbarCard />)
    open()
    fireEvent.click(screen.getByRole('button', { name: 'DISMISS' }))
    elapse(TRANSITION_MS)
    expect(screen.queryByText('CHANGES_SAVED')).not.toBeInTheDocument()
  })

  it('stays open until the timeout elapses, then hides itself', () => {
    renderWithTheme(<SnackbarCard />)
    open()
    elapse(3000)
    expect(screen.getByText('CHANGES_SAVED')).toBeInTheDocument()
    elapse(1000)
    elapse(TRANSITION_MS)
    expect(screen.queryByText('CHANGES_SAVED')).not.toBeInTheDocument()
  })

  it('ignores a click away but closes on Escape', () => {
    renderWithTheme(<SnackbarCard />)
    open()
    fireEvent.mouseDown(document.body)
    fireEvent.click(document.body)
    elapse(TRANSITION_MS)
    expect(screen.getByText('CHANGES_SAVED')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    elapse(TRANSITION_MS)
    expect(screen.queryByText('CHANGES_SAVED')).not.toBeInTheDocument()
  })
})
