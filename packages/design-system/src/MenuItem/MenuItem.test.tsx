import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../theme/themes'
import { MenuItem } from './MenuItem'

describe('MenuItem', () => {
  it('renders a semantic option with its label and value', () => {
    renderWithTheme(<MenuItem value="a">Alpha</MenuItem>)
    const option = screen.getByRole('option', { name: 'Alpha' })
    expect(option.tagName).toBe('LI')
    expect(option).toHaveAttribute('data-value', 'a')
    expect(option).toHaveAttribute('aria-selected', 'false')
  })

  it('fires onSelect with its value when clicked', () => {
    const onSelect = vi.fn()
    renderWithTheme(
      <MenuItem value={7} onSelect={onSelect}>
        Seven
      </MenuItem>
    )
    fireEvent.click(screen.getByRole('option'))
    expect(onSelect).toHaveBeenCalledWith(7)
  })

  it('does not fire onSelect when disabled', () => {
    const onSelect = vi.fn()
    renderWithTheme(
      <MenuItem value={7} disabled onSelect={onSelect}>
        Seven
      </MenuItem>
    )
    const option = screen.getByRole('option')
    expect(option).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(option)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('prevents default on mousedown so the trigger keeps focus', () => {
    renderWithTheme(<MenuItem value="a">Alpha</MenuItem>)
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    fireEvent(screen.getByRole('option'), event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('shows a checkmark only when selected in multiple mode', () => {
    const { rerender } = renderWithTheme(
      <MenuItem value="a" multiple selected>
        Alpha
      </MenuItem>
    )
    expect(document.querySelector('svg')).toBeInTheDocument()

    rerender(
      <MenuItem value="a" multiple>
        Alpha
      </MenuItem>
    )
    expect(document.querySelector('svg')).not.toBeInTheDocument()
  })

  it('defaults the row text to the accent color main when textColor is unset', () => {
    renderWithTheme(
      <MenuItem value="a" color="error">
        Alpha
      </MenuItem>
    )
    expect(screen.getByRole('option')).toHaveStyle({ color: baseTheme.palette.error.main })
  })

  it('applies its own textColor to the row, overriding the accent default', () => {
    renderWithTheme(
      <MenuItem value="a" textColor="secondary">
        Alpha
      </MenuItem>
    )
    expect(screen.getByRole('option')).toHaveStyle({ color: baseTheme.text.secondary })
  })

  it('applies the accent color when selected', () => {
    renderWithTheme(
      <MenuItem value="a" selected>
        Alpha
      </MenuItem>
    )
    expect(screen.getByRole('option')).toHaveStyle({ color: baseTheme.palette.primary.main })
  })

  it('renders as a custom element via `as`', () => {
    renderWithTheme(
      <MenuItem value="a" as="div">
        Alpha
      </MenuItem>
    )
    const option = screen.getByRole('option', { name: 'Alpha' })
    expect(option.tagName).toBe('DIV')
    expect(option).toHaveAttribute('tabindex', '-1')
  })

  it('applies compact vertical padding when dense', () => {
    const { rerender } = renderWithTheme(
      <MenuItem value="a" size="md">
        Alpha
      </MenuItem>
    )
    expect(screen.getByRole('option')).toHaveStyle({ paddingTop: baseTheme.space[1] })
    rerender(
      <MenuItem value="a" size="md" dense>
        Alpha
      </MenuItem>
    )
    expect(screen.getByRole('option')).toHaveStyle({ paddingTop: baseTheme.space[0.5] })
  })

  it('removes horizontal padding when disableGutters', () => {
    renderWithTheme(
      <MenuItem value="a" disableGutters>
        Alpha
      </MenuItem>
    )
    expect(screen.getByRole('option')).toHaveStyle({ paddingLeft: '0px', paddingRight: '0px' })
  })

  it('adds a bottom border when divider', () => {
    renderWithTheme(
      <MenuItem value="a" divider>
        Alpha
      </MenuItem>
    )
    expect(screen.getByRole('option')).toHaveStyle({
      borderBottomStyle: 'solid',
      borderBottomColor: baseTheme.border.light,
    })
  })

  it('focuses the row on mount when autoFocus is set', () => {
    renderWithTheme(
      <MenuItem value="a" autoFocus>
        Alpha
      </MenuItem>
    )
    expect(screen.getByRole('option')).toHaveFocus()
  })

  it('applies focusVisibleClassName on keyboard focus and clears it on blur', () => {
    renderWithTheme(
      <MenuItem value="a" focusVisibleClassName="fv">
        Alpha
      </MenuItem>
    )
    const option = screen.getByRole('option')
    vi.spyOn(option, 'matches').mockReturnValue(true)
    fireEvent.focus(option)
    expect(option).toHaveClass('fv')
    fireEvent.blur(option)
    expect(option).not.toHaveClass('fv')
  })

  it('does not apply focusVisibleClassName for pointer focus', () => {
    renderWithTheme(
      <MenuItem value="a" focusVisibleClassName="fv">
        Alpha
      </MenuItem>
    )
    const option = screen.getByRole('option')
    vi.spyOn(option, 'matches').mockReturnValue(false)
    fireEvent.focus(option)
    expect(option).not.toHaveClass('fv')
  })

  it('treats an unsupported :focus-visible match as non-keyboard focus', () => {
    renderWithTheme(
      <MenuItem value="a" focusVisibleClassName="fv">
        Alpha
      </MenuItem>
    )
    const option = screen.getByRole('option')
    vi.spyOn(option, 'matches').mockImplementation(() => {
      throw new Error('unsupported selector')
    })
    fireEvent.focus(option)
    expect(option).not.toHaveClass('fv')
  })
})
