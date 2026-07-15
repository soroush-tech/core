import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '../../utils/test/renderWithTheme'
import { baseTheme } from '../../themes'
import { ToggleButtonGroup } from '../ToggleButtonGroup'
import { ToggleButton } from './ToggleButton'

describe('ToggleButton', () => {
  it('renders a button with aria-pressed false by default', () => {
    renderWithTheme(<ToggleButton value="bold">Bold</ToggleButton>)
    const button = screen.getByRole('button', { name: 'Bold' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('sets aria-pressed and active styling when isSelected', () => {
    renderWithTheme(
      <ToggleButton value="bold" isSelected color="primary">
        Bold
      </ToggleButton>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toHaveStyle({
      color: baseTheme.palette.primary.main,
      borderColor: baseTheme.palette.primary.main,
    })
  })

  it('fires onChange with its value when toggled standalone', () => {
    const onChange = vi.fn()
    renderWithTheme(
      <ToggleButton value="check" onChange={onChange}>
        Check
      </ToggleButton>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onChange).toHaveBeenCalledWith('check')
  })

  it('also forwards native onClick', () => {
    const onClick = vi.fn()
    renderWithTheme(
      <ToggleButton value="check" onClick={onClick}>
        Check
      </ToggleButton>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('infers selection, color, size, and disabled from the group context', () => {
    renderWithTheme(
      <ToggleButtonGroup value="web" isExclusive color="secondary" size="lg" disabled>
        <ToggleButton value="web">Web</ToggleButton>
        <ToggleButton value="ios">iOS</ToggleButton>
      </ToggleButtonGroup>
    )
    const web = screen.getByRole('button', { name: 'Web' })
    const ios = screen.getByRole('button', { name: 'iOS' })
    expect(web).toHaveAttribute('aria-pressed', 'true')
    expect(web).toHaveStyle({ color: baseTheme.palette.secondary.main })
    expect(ios).toHaveAttribute('aria-pressed', 'false')
    expect(web).toBeDisabled()
    expect(ios).toBeDisabled()
  })

  it('infers selection from an array group value', () => {
    renderWithTheme(
      <ToggleButtonGroup value={['bold', 'italic']}>
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="underline">Underline</ToggleButton>
      </ToggleButtonGroup>
    )
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Underline' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('lets explicit props override the group context', () => {
    renderWithTheme(
      <ToggleButtonGroup value="web" disabled>
        <ToggleButton value="web" isSelected={false} disabled={false}>
          Web
        </ToggleButton>
      </ToggleButtonGroup>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button).not.toBeDisabled()
  })

  it('stretches to full width when fullWidth is set', () => {
    renderWithTheme(
      <ToggleButton value="x" fullWidth>
        X
      </ToggleButton>
    )
    expect(screen.getByRole('button')).toHaveStyle({ width: '100%' })
  })

  it('applies size density padding', () => {
    renderWithTheme(
      <ToggleButton value="x" size="sm">
        X
      </ToggleButton>
    )
    expect(screen.getByRole('button')).toHaveStyle({
      paddingTop: baseTheme.space[baseTheme.sizes.sm.paddingTop],
    })
  })

  it('disables the button and sets aria-busy while loading', () => {
    renderWithTheme(
      <ToggleButton value="save" loading>
        Save
      </ToggleButton>
    )
    const button = screen.getByRole('button', { name: /save/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('renders a start icon', () => {
    renderWithTheme(
      <ToggleButton value="x" startIcon={<span data-testid="icon" />}>
        X
      </ToggleButton>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('forwards HTML attributes without leaking custom props to the DOM', () => {
    renderWithTheme(
      <ToggleButton value="x" isSelected aria-label="toggle x" data-testid="toggle">
        X
      </ToggleButton>
    )
    const button = screen.getByTestId('toggle')
    expect(button).toHaveAttribute('aria-label', 'toggle x')
    expect(button).not.toHaveAttribute('isSelected')
    expect(button).not.toHaveAttribute('fullWidth')
  })
})
