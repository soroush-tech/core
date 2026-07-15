import { screen, fireEvent, render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { ThemeProvider } from '../ThemeProvider'
import { createTheme, baseTheme } from '../themes'
import { useFormControl } from '../FormControl'
import { Form } from './Form'

const Probe = () => {
  const fc = useFormControl()
  return (
    <span
      data-testid="probe"
      data-size={fc.size}
      data-disabled={String(fc.disabled)}
      data-fullwidth={String(fc.fullWidth)}
      data-color={fc.color ?? ''}
      data-textcolor={fc.textColor ?? ''}
    />
  )
}

describe('Form', () => {
  it('renders a form element', () => {
    renderWithTheme(
      <Form data-testid="form">
        <span>child</span>
      </Form>
    )
    expect(screen.getByTestId('form').tagName.toLowerCase()).toBe('form')
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('provides form-wide defaults via context', () => {
    renderWithTheme(
      <Form size="lg" color="secondary" textColor="info" disabled fullWidth>
        <Probe />
      </Form>
    )
    const probe = screen.getByTestId('probe')
    expect(probe).toHaveAttribute('data-size', 'lg')
    expect(probe).toHaveAttribute('data-disabled', 'true')
    expect(probe).toHaveAttribute('data-fullwidth', 'true')
    expect(probe).toHaveAttribute('data-color', 'secondary')
    expect(probe).toHaveAttribute('data-textcolor', 'info')
  })

  it('applies theme.components.Form.styleOverrides.root to the form element', () => {
    const theme = createTheme(baseTheme, {
      components: { Form: { styleOverrides: { root: { display: 'grid' } } } },
    })
    render(
      <ThemeProvider theme={theme}>
        <Form data-testid="form">
          <span>child</span>
        </Form>
      </ThemeProvider>
    )
    expect(screen.getByTestId('form')).toHaveStyle({ display: 'grid' })
  })

  it('calls onSubmit when the form is submitted', () => {
    const onSubmit = vi.fn((event) => event.preventDefault())
    renderWithTheme(
      <Form onSubmit={onSubmit} data-testid="form">
        <button type="submit">Go</button>
      </Form>
    )
    fireEvent.submit(screen.getByTestId('form'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('forwards id, className and noValidate', () => {
    renderWithTheme(
      <Form id="contact" className="my-form" noValidate data-testid="form">
        <span>child</span>
      </Form>
    )
    const form = screen.getByTestId('form')
    expect(form).toHaveAttribute('id', 'contact')
    expect(form).toHaveClass('my-form')
    expect(form).toHaveAttribute('novalidate')
  })
})
