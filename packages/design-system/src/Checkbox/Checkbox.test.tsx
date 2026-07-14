import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { dark } from '../themes'
import { FormControl } from '../FormControl'
import { FormHelperText } from '../FormHelperText'
import { Checkbox } from '../Checkbox'

describe('Checkbox', () => {
  // ─── element ─────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders a checkbox input', () => {
      renderWithTheme(<Checkbox />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders a label as root element', () => {
      renderWithTheme(<Checkbox data-testid="cb" />)
      expect(screen.getByTestId('cb').tagName.toLowerCase()).toBe('label')
    })
  })

  // ─── controlled ──────────────────────────────────────────────────────────────

  describe('controlled', () => {
    it('reflects checked=true', () => {
      renderWithTheme(<Checkbox checked onChange={() => {}} />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('reflects checked=false', () => {
      renderWithTheme(<Checkbox checked={false} onChange={() => {}} />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('calls onChange when clicked', () => {
      const onChange = vi.fn()
      renderWithTheme(<Checkbox checked onChange={onChange} />)
      fireEvent.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  // ─── uncontrolled ─────────────────────────────────────────────────────────────

  describe('uncontrolled', () => {
    it('starts unchecked by default', () => {
      renderWithTheme(<Checkbox />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('starts checked when defaultChecked=true', () => {
      renderWithTheme(<Checkbox defaultChecked />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('toggles on click', () => {
      renderWithTheme(<Checkbox />)
      const input = screen.getByRole('checkbox')
      fireEvent.click(input)
      expect(input).toBeChecked()
    })
  })

  // ─── disabled ─────────────────────────────────────────────────────────────────

  describe('disabled', () => {
    it('disables the input', () => {
      renderWithTheme(<Checkbox disabled />)
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })

    it('does not call onChange when disabled', () => {
      const onChange = vi.fn()
      renderWithTheme(<Checkbox disabled onChange={onChange} />)
      fireEvent.change(screen.getByRole('checkbox'), { target: { checked: true } })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── onChange ─────────────────────────────────────────────────────────────────

  describe('onChange', () => {
    it('calls onChange when toggled', () => {
      const onChange = vi.fn()
      renderWithTheme(<Checkbox onChange={onChange} />)
      fireEvent.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('passes the event to onChange', () => {
      const onChange = vi.fn()
      renderWithTheme(<Checkbox onChange={onChange} />)
      fireEvent.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: expect.any(Object) }))
    })
  })

  // ─── indeterminate ────────────────────────────────────────────────────────────

  describe('indeterminate', () => {
    it('sets input.indeterminate property', () => {
      const { container } = renderWithTheme(<Checkbox indeterminate />)
      expect(container.querySelector('input')?.indeterminate).toBe(true)
    })

    it('sets data-indeterminate attribute on input', () => {
      const { container } = renderWithTheme(<Checkbox indeterminate />)
      expect(container.querySelector('input')).toHaveAttribute('data-indeterminate', 'true')
    })

    it('clears indeterminate when prop changes to false', () => {
      const { rerender, container } = renderWithTheme(<Checkbox indeterminate />)
      rerender(<Checkbox indeterminate={false} />)
      expect(container.querySelector('input')?.indeterminate).toBe(false)
    })
  })

  // ─── color ────────────────────────────────────────────────────────────────────

  describe('color', () => {
    it('default color resolves to theme.text.secondary', () => {
      renderWithTheme(<Checkbox color="default" data-testid="cb" />)
      expect(screen.getByTestId('cb')).toHaveStyle({ color: dark.text.secondary })
    })

    it('resolves theme.palette[color].main for named colors', () => {
      const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const
      colors.forEach((color) => {
        const { unmount } = renderWithTheme(<Checkbox color={color} data-testid="cb" />)
        expect(screen.getByTestId('cb')).toHaveStyle({ color: dark.palette[color].main })
        unmount()
      })
    })

    it('does not forward color to DOM', () => {
      renderWithTheme(<Checkbox color="primary" data-testid="cb" />)
      expect(screen.getByTestId('cb')).not.toHaveAttribute('color')
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────────────

  describe('size', () => {
    it('sm — sets 16px font-size on icon wrapper', () => {
      const { container } = renderWithTheme(<Checkbox size="sm" />)
      expect(container.querySelector('span')).toHaveStyle({ fontSize: '16px' })
    })

    it('md — sets 20px font-size on icon wrapper', () => {
      const { container } = renderWithTheme(<Checkbox size="md" />)
      expect(container.querySelector('span')).toHaveStyle({ fontSize: '20px' })
    })

    it('lg — sets 24px font-size on icon wrapper', () => {
      const { container } = renderWithTheme(<Checkbox size="lg" />)
      expect(container.querySelector('span')).toHaveStyle({ fontSize: '24px' })
    })

    it('does not forward size to DOM', () => {
      renderWithTheme(<Checkbox size="md" data-testid="cb" />)
      expect(screen.getByTestId('cb')).not.toHaveAttribute('size')
    })
  })

  // ─── fullWidth ────────────────────────────────────────────────────────────────

  describe('fullWidth', () => {
    it('sets width 100% on root', () => {
      renderWithTheme(<Checkbox fullWidth data-testid="cb" />)
      expect(screen.getByTestId('cb')).toHaveStyle({ width: '100%' })
    })

    it('does not forward fullWidth to DOM', () => {
      renderWithTheme(<Checkbox fullWidth data-testid="cb" />)
      expect(screen.getByTestId('cb')).not.toHaveAttribute('fullWidth')
    })
  })

  // ─── icons ────────────────────────────────────────────────────────────────────

  // All three icon spans are always in the DOM; CSS toggles visibility via :checked/:indeterminate.
  // These tests verify DOM placement — CSS behaviour is covered by Storybook tests.
  describe('icons', () => {
    it('always renders all three icon spans in the DOM', () => {
      const { container } = renderWithTheme(<Checkbox />)
      expect(container.querySelector('.cb-unchecked')).toBeInTheDocument()
      expect(container.querySelector('.cb-checked')).toBeInTheDocument()
      expect(container.querySelector('.cb-indeterminate')).toBeInTheDocument()
    })

    it('places custom icon in the .cb-unchecked span', () => {
      const { container } = renderWithTheme(<Checkbox icon={<span>unchecked</span>} />)
      expect(container.querySelector('.cb-unchecked')).toHaveTextContent('unchecked')
    })

    it('places custom checkedIcon in the .cb-checked span', () => {
      const { container } = renderWithTheme(<Checkbox checkedIcon={<span>checked</span>} />)
      expect(container.querySelector('.cb-checked')).toHaveTextContent('checked')
    })

    it('.cb-indeterminate is separate from .cb-checked', () => {
      const { container } = renderWithTheme(
        <Checkbox indeterminate checkedIcon={<span>custom-checked</span>} />
      )
      expect(container.querySelector('.cb-indeterminate')).toBeInTheDocument()
      expect(container.querySelector('.cb-checked')).toHaveTextContent('custom-checked')
      expect(container.querySelector('.cb-indeterminate')).not.toHaveTextContent('custom-checked')
    })
  })

  // ─── children ─────────────────────────────────────────────────────────────────

  describe('children', () => {
    it('renders label text', () => {
      renderWithTheme(<Checkbox>Accept terms</Checkbox>)
      expect(screen.getByText('Accept terms')).toBeInTheDocument()
    })

    it('renders no extra span when children is null', () => {
      const { container } = renderWithTheme(<Checkbox />)
      // Only the icon wrapper span, no children span
      expect(container.querySelectorAll('label > span')).toHaveLength(1)
    })
  })

  // ─── form attributes ──────────────────────────────────────────────────────────

  describe('form attributes', () => {
    it('forwards id to the input', () => {
      renderWithTheme(<Checkbox id="my-cb" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'my-cb')
    })

    it('forwards required to the input', () => {
      renderWithTheme(<Checkbox required />)
      expect(screen.getByRole('checkbox')).toBeRequired()
    })

    it('forwards name to the input', () => {
      renderWithTheme(<Checkbox name="agree" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('name', 'agree')
    })
  })

  // ─── accessibility ────────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('forwards aria-label to the input', () => {
      renderWithTheme(<Checkbox aria-label="Accept terms" />)
      expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument()
    })

    it('forwards className to the root', () => {
      renderWithTheme(<Checkbox className="custom" data-testid="cb" />)
      expect(screen.getByTestId('cb')).toHaveClass('custom')
    })
  })

  // ─── FormControl context ───────────────────────────────────────────────────────

  describe('FormControl context', () => {
    it('inherits the id from FormControl', () => {
      renderWithTheme(
        <FormControl id="terms">
          <Checkbox />
        </FormControl>
      )
      expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'terms')
    })

    it('inherits disabled from FormControl', () => {
      renderWithTheme(
        <FormControl disabled>
          <Checkbox />
        </FormControl>
      )
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })

    it('inherits color from FormControl', () => {
      renderWithTheme(
        <FormControl color="success">
          <Checkbox data-testid="cb" />
        </FormControl>
      )
      expect(screen.getByTestId('cb')).toHaveStyle({ color: dark.palette.success.main })
    })

    it('sets aria-describedby from the FormControl helper text', () => {
      renderWithTheme(
        <FormControl id="terms">
          <Checkbox />
          <FormHelperText>Required</FormHelperText>
        </FormControl>
      )
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-describedby', 'terms-helper')
    })

    it('lets an explicit aria-describedby override context', () => {
      renderWithTheme(
        <FormControl id="terms">
          <Checkbox aria-describedby="explicit" />
          <FormHelperText>Required</FormHelperText>
        </FormControl>
      )
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-describedby', 'explicit')
    })

    it('lets an explicit color override context', () => {
      renderWithTheme(
        <FormControl color="success">
          <Checkbox color="error" data-testid="cb" />
        </FormControl>
      )
      expect(screen.getByTestId('cb')).toHaveStyle({ color: dark.palette.error.main })
    })
  })
})
