import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { FormHelperText } from '../FormHelperText'
import { FormControl } from './FormControl'
import { useFormControl } from './useFormControl'

const Probe = () => {
  const fc = useFormControl()
  return (
    <span
      data-testid="probe"
      data-id={fc.id ?? ''}
      data-error={String(fc.error)}
      data-disabled={String(fc.disabled)}
      data-required={String(fc.required)}
      data-size={fc.size}
      data-fullwidth={String(fc.fullWidth)}
      data-color={fc.color ?? ''}
      data-textcolor={fc.textColor ?? ''}
      data-describedby={fc['aria-describedby'] ?? ''}
    />
  )
}

describe('FormControl', () => {
  it('renders its children', () => {
    renderWithTheme(
      <FormControl>
        <span>child</span>
      </FormControl>
    )
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('provides field state to descendants via context', () => {
    renderWithTheme(
      <FormControl error disabled required size="lg" fullWidth color="info" textColor="success">
        <Probe />
      </FormControl>
    )
    const probe = screen.getByTestId('probe')
    expect(probe).toHaveAttribute('data-error', 'true')
    expect(probe).toHaveAttribute('data-disabled', 'true')
    expect(probe).toHaveAttribute('data-required', 'true')
    expect(probe).toHaveAttribute('data-size', 'lg')
    expect(probe).toHaveAttribute('data-fullwidth', 'true')
    expect(probe).toHaveAttribute('data-color', 'info')
    expect(probe).toHaveAttribute('data-textcolor', 'success')
  })

  it('auto-generates an id when none is provided', () => {
    renderWithTheme(
      <FormControl>
        <Probe />
      </FormControl>
    )
    expect(screen.getByTestId('probe').getAttribute('data-id')).not.toBe('')
  })

  it('uses an explicit id when provided', () => {
    renderWithTheme(
      <FormControl id="email">
        <Probe />
      </FormControl>
    )
    expect(screen.getByTestId('probe')).toHaveAttribute('data-id', 'email')
  })

  it('stretches the root when fullWidth', () => {
    renderWithTheme(
      <FormControl fullWidth data-testid="root">
        <span>child</span>
      </FormControl>
    )
    expect(screen.getByTestId('root')).toHaveStyle({ width: '100%' })
  })

  it('forwards View props to the root', () => {
    renderWithTheme(
      <FormControl data-testid="root" className="my-control">
        <span>child</span>
      </FormControl>
    )
    expect(screen.getByTestId('root')).toHaveClass('my-control')
  })

  it('exposes the helper id via aria-describedby once a helper is rendered', () => {
    renderWithTheme(
      <FormControl id="email">
        <Probe />
        <FormHelperText>Helper</FormHelperText>
      </FormControl>
    )
    expect(screen.getByTestId('probe')).toHaveAttribute('data-describedby', 'email-helper')
  })
})
