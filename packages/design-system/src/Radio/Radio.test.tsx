import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { ThemeProvider } from '../ThemeProvider'
import { createTheme, baseTheme, type Theme } from '../themes'
import { FormControl } from '../FormControl'
import { FormHelperText } from '../FormHelperText'
import { Radio, type RadioSize } from '../Radio'

describe('Radio', () => {
  // ─── element ─────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders a radio input', () => {
      renderWithTheme(<Radio />)
      expect(screen.getByRole('radio')).toBeInTheDocument()
    })

    it('renders a label as root element', () => {
      renderWithTheme(<Radio data-testid="rb" />)
      expect(screen.getByTestId('rb').tagName.toLowerCase()).toBe('label')
    })
  })

  // ─── controlled ──────────────────────────────────────────────────────────────

  describe('controlled', () => {
    it('reflects checked=true', () => {
      renderWithTheme(<Radio checked onChange={() => {}} />)
      expect(screen.getByRole('radio')).toBeChecked()
    })

    it('reflects checked=false', () => {
      renderWithTheme(<Radio checked={false} onChange={() => {}} />)
      expect(screen.getByRole('radio')).not.toBeChecked()
    })

    it('calls onChange when clicked (unchecked → checked)', () => {
      const onChange = vi.fn()
      renderWithTheme(<Radio checked={false} onChange={onChange} />)
      fireEvent.click(screen.getByRole('radio'))
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  // ─── disabled ─────────────────────────────────────────────────────────────────

  describe('disabled', () => {
    it('disables the input', () => {
      renderWithTheme(<Radio disabled />)
      expect(screen.getByRole('radio')).toBeDisabled()
    })

    it('does not call onChange when disabled', () => {
      const onChange = vi.fn()
      renderWithTheme(<Radio disabled onChange={onChange} />)
      fireEvent.change(screen.getByRole('radio'), { target: { checked: true } })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── onChange ─────────────────────────────────────────────────────────────────

  describe('onChange', () => {
    it('calls onChange when clicked', () => {
      const onChange = vi.fn()
      renderWithTheme(<Radio onChange={onChange} />)
      fireEvent.click(screen.getByRole('radio'))
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('passes the event to onChange', () => {
      const onChange = vi.fn()
      renderWithTheme(<Radio onChange={onChange} />)
      fireEvent.click(screen.getByRole('radio'))
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: expect.any(Object) }))
    })
  })

  // ─── color ────────────────────────────────────────────────────────────────────

  describe('color', () => {
    it('default color resolves to theme.text.secondary', () => {
      renderWithTheme(<Radio color="default" data-testid="rb" />)
      expect(screen.getByTestId('rb')).toHaveStyle({ color: baseTheme.text.secondary })
    })

    it('resolves theme.palette[color].main for named colors', () => {
      const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const
      colors.forEach((color) => {
        const { unmount } = renderWithTheme(<Radio color={color} data-testid="rb" />)
        expect(screen.getByTestId('rb')).toHaveStyle({ color: baseTheme.palette[color].main })
        unmount()
      })
    })

    it('does not forward color to DOM', () => {
      renderWithTheme(<Radio color="primary" data-testid="rb" />)
      expect(screen.getByTestId('rb')).not.toHaveAttribute('color')
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────────────

  describe('size', () => {
    it('sm — sets theme.icon.sm font-size on icon wrapper', () => {
      const { container } = renderWithTheme(<Radio size="sm" />)
      expect(container.querySelector('span')).toHaveStyle({ fontSize: '1rem' })
    })

    it('md — sets theme.icon.md font-size on icon wrapper', () => {
      const { container } = renderWithTheme(<Radio size="md" />)
      expect(container.querySelector('span')).toHaveStyle({ fontSize: '1.25rem' })
    })

    it('lg — sets theme.icon.lg font-size on icon wrapper', () => {
      const { container } = renderWithTheme(<Radio size="lg" />)
      expect(container.querySelector('span')).toHaveStyle({ fontSize: '1.5rem' })
    })

    it('reads augmented sizes from theme.icon (the theme supplies the glyph size)', () => {
      const augmented = createTheme(baseTheme, {
        sizes: { xl: { ...baseTheme.sizes.lg } } as Partial<Theme['sizes']>,
        icon: { xl: '2rem' } as Partial<Theme['icon']>,
      })
      const { container } = renderWithTheme(<Radio size={'xl' as RadioSize} />, {
        wrapper: ({ children }) => <ThemeProvider theme={augmented}>{children}</ThemeProvider>,
      })
      expect(container.querySelector('span')).toHaveStyle({ fontSize: '2rem' })
    })

    it('does not forward size to DOM', () => {
      renderWithTheme(<Radio size="md" data-testid="rb" />)
      expect(screen.getByTestId('rb')).not.toHaveAttribute('size')
    })
  })

  // ─── icons ────────────────────────────────────────────────────────────────────

  // Both icon spans are always in the DOM; CSS toggles visibility via :checked.
  // These tests verify DOM placement — CSS behaviour is covered by Storybook tests.
  describe('icons', () => {
    it('always renders both icon spans in the DOM', () => {
      const { container } = renderWithTheme(<Radio />)
      expect(container.querySelector('.rb-unchecked')).toBeInTheDocument()
      expect(container.querySelector('.rb-checked')).toBeInTheDocument()
    })

    it('places custom icon in the .rb-unchecked span', () => {
      const { container } = renderWithTheme(<Radio icon={<span>unchecked</span>} />)
      expect(container.querySelector('.rb-unchecked')).toHaveTextContent('unchecked')
    })

    it('places custom checkedIcon in the .rb-checked span', () => {
      const { container } = renderWithTheme(<Radio checkedIcon={<span>checked</span>} />)
      expect(container.querySelector('.rb-checked')).toHaveTextContent('checked')
    })
  })

  // ─── inputProps ───────────────────────────────────────────────────────────────

  describe('inputProps', () => {
    it('forwards aria-label via inputProps', () => {
      renderWithTheme(<Radio inputProps={{ 'aria-label': 'Accept terms' }} />)
      expect(screen.getByRole('radio', { name: 'Accept terms' })).toBeInTheDocument()
    })

    it('forwards aria-describedby via inputProps', () => {
      renderWithTheme(<Radio inputProps={{ 'aria-describedby': 'hint' }} />)
      expect(screen.getByRole('radio')).toHaveAttribute('aria-describedby', 'hint')
    })

    it('explicit top-level props take priority over inputProps', () => {
      renderWithTheme(<Radio name="top" inputProps={{ name: 'override' }} />)
      expect(screen.getByRole('radio')).toHaveAttribute('name', 'top')
    })
  })

  // ─── form attributes ──────────────────────────────────────────────────────────

  describe('form attributes', () => {
    it('forwards id to the input', () => {
      renderWithTheme(<Radio id="my-rb" />)
      expect(screen.getByRole('radio')).toHaveAttribute('id', 'my-rb')
    })

    it('forwards required to the input', () => {
      renderWithTheme(<Radio required />)
      expect(screen.getByRole('radio')).toBeRequired()
    })

    it('forwards name to the input', () => {
      renderWithTheme(<Radio name="group" />)
      expect(screen.getByRole('radio')).toHaveAttribute('name', 'group')
    })

    it('forwards value to the input', () => {
      renderWithTheme(<Radio value="option-a" />)
      expect(screen.getByRole('radio')).toHaveAttribute('value', 'option-a')
    })
  })

  // ─── children ─────────────────────────────────────────────────────────────────

  describe('children', () => {
    it('renders label text', () => {
      renderWithTheme(<Radio>Option A</Radio>)
      expect(screen.getByText('Option A')).toBeInTheDocument()
    })

    it('renders no extra span when children is null', () => {
      const { container } = renderWithTheme(<Radio />)
      expect(container.querySelectorAll('label > span')).toHaveLength(1)
    })
  })

  // ─── accessibility ────────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('forwards className to the root', () => {
      renderWithTheme(<Radio className="custom" data-testid="rb" />)
      expect(screen.getByTestId('rb')).toHaveClass('custom')
    })
  })

  // ─── FormControl context ───────────────────────────────────────────────────────

  describe('FormControl context', () => {
    it('inherits the id from FormControl', () => {
      renderWithTheme(
        <FormControl id="plan">
          <Radio name="plan" value="pro" />
        </FormControl>
      )
      expect(screen.getByRole('radio')).toHaveAttribute('id', 'plan')
    })

    it('inherits disabled from FormControl', () => {
      renderWithTheme(
        <FormControl disabled>
          <Radio name="plan" value="pro" />
        </FormControl>
      )
      expect(screen.getByRole('radio')).toBeDisabled()
    })

    it('inherits color from FormControl', () => {
      renderWithTheme(
        <FormControl color="success">
          <Radio name="plan" value="pro" data-testid="rb" />
        </FormControl>
      )
      expect(screen.getByTestId('rb')).toHaveStyle({ color: baseTheme.palette.success.main })
    })

    it('sets aria-describedby from the FormControl helper text', () => {
      renderWithTheme(
        <FormControl id="plan">
          <Radio name="plan" value="pro" />
          <FormHelperText>Pick one</FormHelperText>
        </FormControl>
      )
      expect(screen.getByRole('radio')).toHaveAttribute('aria-describedby', 'plan-helper')
    })

    it('lets an explicit inputProps aria-describedby override context', () => {
      renderWithTheme(
        <FormControl id="plan">
          <Radio name="plan" value="pro" inputProps={{ 'aria-describedby': 'explicit' }} />
          <FormHelperText>Pick one</FormHelperText>
        </FormControl>
      )
      expect(screen.getByRole('radio')).toHaveAttribute('aria-describedby', 'explicit')
    })

    it('lets an explicit color override context', () => {
      renderWithTheme(
        <FormControl color="success">
          <Radio name="plan" value="pro" color="error" data-testid="rb" />
        </FormControl>
      )
      expect(screen.getByTestId('rb')).toHaveStyle({ color: baseTheme.palette.error.main })
    })
  })
})
