import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../theme/themes'
import { Backdrop } from './'

describe('Backdrop', () => {
  it('renders with the theme backdrop background by default', () => {
    renderWithTheme(<Backdrop data-testid="bd" />)
    expect(screen.getByTestId('bd')).toHaveStyle({ backgroundColor: baseTheme.background.backdrop })
  })

  it('is fixed to the viewport', () => {
    renderWithTheme(<Backdrop data-testid="bd" />)
    expect(screen.getByTestId('bd')).toHaveStyle({ position: 'fixed' })
  })

  it('allows overriding the background through the bg prop', () => {
    renderWithTheme(<Backdrop data-testid="bd" bg="modal" />)
    expect(screen.getByTestId('bd')).toHaveStyle({ backgroundColor: baseTheme.background.modal })
  })

  it('forwards click handlers', () => {
    const onClick = vi.fn()
    renderWithTheme(<Backdrop data-testid="bd" onClick={onClick} />)
    fireEvent.click(screen.getByTestId('bd'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
