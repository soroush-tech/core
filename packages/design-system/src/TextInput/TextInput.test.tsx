import type { HTMLAttributes, InputHTMLAttributes } from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { dark } from '../themes'
import { FormControl } from '../FormControl'
import { FormHelperText } from '../FormHelperText'
import { TextInput } from '../TextInput'

describe('TextInput', () => {
  // ─── element ─────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders a textbox', () => {
      renderWithTheme(<TextInput />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders a div as root', () => {
      renderWithTheme(<TextInput data-testid="root" />)
      expect(screen.getByTestId('root').tagName.toLowerCase()).toBe('div')
    })

    it('renders input by default', () => {
      const { container } = renderWithTheme(<TextInput />)
      expect(container.querySelector('input')).toBeInTheDocument()
    })
  })

  // ─── multiline ────────────────────────────────────────────────────────────────

  describe('multiline', () => {
    it('renders textarea when multiline', () => {
      const { container } = renderWithTheme(<TextInput multiline />)
      expect(container.querySelector('textarea')).toBeInTheDocument()
      expect(container.querySelector('input')).not.toBeInTheDocument()
    })

    it('renders textarea automatically when rows > 1', () => {
      const { container } = renderWithTheme(<TextInput rows={3} />)
      expect(container.querySelector('textarea')).toBeInTheDocument()
      expect(container.querySelector('input')).not.toBeInTheDocument()
    })

    it('renders input when rows=1 and multiline is not set', () => {
      const { container } = renderWithTheme(<TextInput rows={1} />)
      expect(container.querySelector('input')).toBeInTheDocument()
    })

    it('forwards rows to textarea', () => {
      const { container } = renderWithTheme(<TextInput rows={4} />)
      expect(container.querySelector('textarea')).toHaveAttribute('rows', '4')
    })

    it('textarea always has no resize handle', () => {
      const { container } = renderWithTheme(<TextInput multiline />)
      expect(container.querySelector('textarea')).toHaveStyle({ resize: 'none' })
    })

    it('plain textarea scrolls when content overflows', () => {
      const { container } = renderWithTheme(<TextInput rows={4} />)
      expect(container.querySelector('textarea')).toHaveStyle({ overflow: 'auto' })
    })
  })

  // ─── resize ───────────────────────────────────────────────────────────────────

  describe('resize', () => {
    it('renders a textarea when resize is set without multiline', () => {
      const { container } = renderWithTheme(<TextInput resize />)
      expect(container.querySelector('textarea')).toBeInTheDocument()
      expect(container.querySelector('input')).not.toBeInTheDocument()
    })

    it('multiline without resize renders plain scrolling textarea', () => {
      const { container } = renderWithTheme(<TextInput multiline />)
      expect(container.querySelector('textarea')).toHaveStyle({ overflow: 'auto' })
    })

    it('falls back to input when type is incompatible with textarea', () => {
      const { container } = renderWithTheme(<TextInput multiline type="email" />)
      expect(container.querySelector('input')).toBeInTheDocument()
      expect(container.querySelector('textarea')).not.toBeInTheDocument()
    })

    it('renders textarea when type is text', () => {
      const { container } = renderWithTheme(<TextInput multiline type="text" />)
      expect(container.querySelector('textarea')).toBeInTheDocument()
    })

    it('renders textarea when type is empty string', () => {
      const { container } = renderWithTheme(<TextInput multiline type="" />)
      expect(container.querySelector('textarea')).toBeInTheDocument()
    })

    // ─── minRows fallback: rows !== undefined ? rows : undefined ─────────────────

    describe('minRows fallback', () => {
      beforeEach(() => {
        vi.spyOn(window, 'getComputedStyle').mockReturnValue({
          lineHeight: '20px',
          fontSize: '16px',
          paddingTop: '4px',
          paddingBottom: '4px',
        } as CSSStyleDeclaration)
        Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
          configurable: true,
          get: () => 0,
        })
      })

      afterEach(() => {
        vi.restoreAllMocks()
      })

      it('uses rows as minRows when minRows is not provided', () => {
        const { container } = renderWithTheme(<TextInput resize rows={3} />)
        const el = container.querySelector('textarea') as HTMLTextAreaElement
        // minRows=3, lineHeight=20, paddingY=8 → min = 3×20+8 = 68px
        expect(parseFloat(el.style.height)).toBeGreaterThanOrEqual(68)
      })

      it('prefers explicit minRows over rows', () => {
        const { container } = renderWithTheme(<TextInput resize rows={3} minRows={5} />)
        const el = container.querySelector('textarea') as HTMLTextAreaElement
        // minRows=5 → min = 5×20+8 = 108px
        expect(parseFloat(el.style.height)).toBeGreaterThanOrEqual(108)
      })

      it('passes undefined as minRows when neither minRows nor rows is provided', () => {
        const { container } = renderWithTheme(<TextInput resize />)
        // rows === undefined branch: minRows receives undefined, TextAreaAutoResize defaults to 1
        expect(container.querySelector('textarea')).toBeInTheDocument()
      })
    })
  })

  // ─── size ────────────────────────────────────────────────────────────────────

  describe('size', () => {
    it('accepts all size tokens without error', () => {
      ;(['sm', 'md', 'lg'] as const).forEach((size) => {
        const { unmount } = renderWithTheme(<TextInput size={size} />)
        expect(screen.getByRole('textbox')).toBeInTheDocument()
        unmount()
      })
    })

    it('does not forward size as a DOM attribute on input', () => {
      const { container } = renderWithTheme(<TextInput size="sm" />)
      expect(container.querySelector('input')).not.toHaveAttribute('size', 'sm')
    })

    it('does not forward size as a DOM attribute on textarea', () => {
      const { container } = renderWithTheme(<TextInput multiline size="sm" />)
      expect(container.querySelector('textarea')).not.toHaveAttribute('size', 'sm')
    })
  })

  // ─── controlled ──────────────────────────────────────────────────────────────

  describe('controlled', () => {
    it('reflects value prop', () => {
      renderWithTheme(<TextInput value="hello" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('hello')
    })
  })

  // ─── disabled ─────────────────────────────────────────────────────────────────

  describe('disabled', () => {
    it('disables the native input', () => {
      renderWithTheme(<TextInput disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  // ─── error ────────────────────────────────────────────────────────────────────

  describe('error', () => {
    it('applies error.main border color', () => {
      renderWithTheme(<TextInput error data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ borderColor: dark.palette.error.main })
    })

    it('error overrides the color prop border', () => {
      renderWithTheme(<TextInput color="primary" error data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ borderColor: dark.palette.error.main })
    })
  })

  // ─── color ────────────────────────────────────────────────────────────────────

  describe('color', () => {
    it('resting border uses palette[color].light', () => {
      renderWithTheme(<TextInput color="primary" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({
        borderColor: dark.palette.primary.light,
      })
    })

    it('applies the correct light color for each palette token', () => {
      const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const
      colors.forEach((color) => {
        const { unmount } = renderWithTheme(<TextInput color={color} data-testid="root" />)
        expect(screen.getByTestId('root')).toHaveStyle({
          borderColor: dark.palette[color].light,
        })
        unmount()
      })
    })
  })

  // ─── variant ──────────────────────────────────────────────────────────────────

  describe('variant', () => {
    it('outlined (default) has border-radius from theme', () => {
      renderWithTheme(<TextInput data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ borderRadius: dark.radii.sq })
    })

    it('outlined has terminal background', () => {
      renderWithTheme(<TextInput variant="outlined" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({
        backgroundColor: dark.background.terminal,
      })
    })

    it('underline has no border-radius', () => {
      renderWithTheme(<TextInput variant="underline" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ borderRadius: '0px' })
    })

    it('text has no border-radius', () => {
      renderWithTheme(<TextInput variant="text" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ borderRadius: '0px' })
    })
  })

  // ─── borderRadius ────────────────────────────────────────────────────────────

  describe('borderRadius', () => {
    it('applies borderRadius to default variant', () => {
      renderWithTheme(<TextInput borderRadius="md" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ borderRadius: dark.radii.md })
    })

    it('applies borderRadius to outlined variant', () => {
      renderWithTheme(<TextInput variant="outlined" borderRadius="md" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ borderRadius: dark.radii.md })
    })

    it('ignores borderRadius on underline variant', () => {
      renderWithTheme(<TextInput variant="underline" borderRadius="md" data-testid="root" />)
      expect(screen.getByTestId('root')).not.toHaveStyle({ borderRadius: dark.radii.md })
    })

    it('ignores borderRadius on text variant', () => {
      renderWithTheme(<TextInput variant="text" borderRadius="md" data-testid="root" />)
      expect(screen.getByTestId('root')).not.toHaveStyle({ borderRadius: dark.radii.md })
    })
  })

  // ─── fullWidth ────────────────────────────────────────────────────────────────

  describe('fullWidth', () => {
    it('sets width 100% on root', () => {
      renderWithTheme(<TextInput fullWidth data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ width: '100%' })
    })
  })

  // ─── layout ──────────────────────────────────────────────────────────────────

  describe('layout', () => {
    it('applies width to root', () => {
      renderWithTheme(<TextInput width="200px" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ width: '200px' })
    })

    it('applies minWidth to root', () => {
      renderWithTheme(<TextInput minWidth="100px" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ minWidth: '100px' })
    })

    it('applies maxWidth to root', () => {
      renderWithTheme(<TextInput maxWidth="400px" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ maxWidth: '400px' })
    })
  })

  // ─── onChange ─────────────────────────────────────────────────────────────────

  describe('onChange', () => {
    it('calls onChange on input', () => {
      const onChange = vi.fn()
      renderWithTheme(<TextInput onChange={onChange} />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } })
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('passes the event to onChange', () => {
      const onChange = vi.fn()
      renderWithTheme(<TextInput onChange={onChange} />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } })
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: expect.any(Object) }))
    })
  })

  // ─── form attributes ──────────────────────────────────────────────────────────

  describe('form attributes', () => {
    it('forwards id', () => {
      renderWithTheme(<TextInput id="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email')
    })

    it('forwards name', () => {
      renderWithTheme(<TextInput name="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
    })

    it('forwards required', () => {
      renderWithTheme(<TextInput required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    it('forwards readOnly', () => {
      renderWithTheme(<TextInput readOnly />)
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
    })

    it('forwards placeholder', () => {
      renderWithTheme(<TextInput placeholder="Enter value" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Enter value')
    })

    it('forwards type to input', () => {
      const { container } = renderWithTheme(<TextInput type="email" />)
      expect(container.querySelector('input')).toHaveAttribute('type', 'email')
    })

    it('does not forward type when multiline', () => {
      const { container } = renderWithTheme(<TextInput multiline />)
      expect(container.querySelector('textarea')).not.toHaveAttribute('type')
    })
  })

  // ─── inputProps ───────────────────────────────────────────────────────────────

  describe('inputProps', () => {
    it('forwards aria-label via inputProps', () => {
      renderWithTheme(<TextInput inputProps={{ 'aria-label': 'Email address' }} />)
      expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument()
    })

    it('forwards aria-describedby via inputProps', () => {
      renderWithTheme(<TextInput inputProps={{ 'aria-describedby': 'hint' }} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'hint')
    })

    it('explicit top-level props take priority over inputProps', () => {
      renderWithTheme(<TextInput name="top" inputProps={{ name: 'override' }} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'top')
    })
  })

  // ─── inputSize ────────────────────────────────────────────────────────────────

  describe('inputSize', () => {
    it('forwards inputSize as native size attribute on input', () => {
      const { container } = renderWithTheme(<TextInput inputSize={20} />)
      expect(container.querySelector('input')).toHaveAttribute('size', '20')
    })

    it('does not forward inputSize when multiline', () => {
      const { container } = renderWithTheme(<TextInput multiline inputSize={20} />)
      expect(container.querySelector('textarea')).not.toHaveAttribute('size')
    })
  })

  // ─── inputComponent / components ─────────────────────────────────────────────

  describe('inputComponent', () => {
    it('renders the custom input component', () => {
      const Custom = (props: InputHTMLAttributes<HTMLInputElement>) => (
        <input data-custom="yes" {...props} />
      )
      renderWithTheme(<TextInput inputComponent={Custom} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('data-custom', 'yes')
    })

    it('components.Input is used when inputComponent is not set', () => {
      const Custom = (props: InputHTMLAttributes<HTMLInputElement>) => (
        <input data-slot="input" {...props} />
      )
      renderWithTheme(<TextInput components={{ Input: Custom }} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('data-slot', 'input')
    })

    it('inputComponent takes priority over components.Input', () => {
      const Primary = (props: InputHTMLAttributes<HTMLInputElement>) => (
        <input data-which="primary" {...props} />
      )
      const Secondary = (props: InputHTMLAttributes<HTMLInputElement>) => (
        <input data-which="secondary" {...props} />
      )
      renderWithTheme(<TextInput inputComponent={Primary} components={{ Input: Secondary }} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('data-which', 'primary')
    })
  })

  describe('components.Root', () => {
    it('renders the custom root component', () => {
      const CustomRoot = ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
        <section data-root="custom" {...props}>
          {children}
        </section>
      )
      renderWithTheme(<TextInput components={{ Root: CustomRoot }} data-testid="root" />)
      expect(screen.getByTestId('root').tagName.toLowerCase()).toBe('section')
      expect(screen.getByTestId('root')).toHaveAttribute('data-root', 'custom')
    })
  })

  // ─── classes ──────────────────────────────────────────────────────────────────

  describe('classes', () => {
    it('applies classes.root to the root element', () => {
      renderWithTheme(<TextInput classes={{ root: 'my-root' }} data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveClass('my-root')
    })

    it('applies classes.input to the native element', () => {
      const { container } = renderWithTheme(<TextInput classes={{ input: 'my-input' }} />)
      expect(container.querySelector('input')).toHaveClass('my-input')
    })

    it('merges classes.root with className', () => {
      renderWithTheme(
        <TextInput className="outer" classes={{ root: 'inner' }} data-testid="root" />
      )
      const root = screen.getByTestId('root')
      expect(root).toHaveClass('outer')
      expect(root).toHaveClass('inner')
    })
  })

  // ─── FormControl context ───────────────────────────────────────────────────────

  describe('FormControl context', () => {
    it('inherits the id from FormControl', () => {
      renderWithTheme(
        <FormControl id="email">
          <TextInput />
        </FormControl>
      )
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email')
    })

    it('sets aria-describedby from the FormControl helper text', () => {
      renderWithTheme(
        <FormControl id="email">
          <TextInput />
          <FormHelperText>Helper</FormHelperText>
        </FormControl>
      )
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'email-helper')
    })

    it('inherits disabled from FormControl', () => {
      renderWithTheme(
        <FormControl disabled>
          <TextInput />
        </FormControl>
      )
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('inherits the error border from FormControl', () => {
      renderWithTheme(
        <FormControl error>
          <TextInput data-testid="root" />
        </FormControl>
      )
      expect(screen.getByTestId('root')).toHaveStyle({ borderColor: dark.palette.error.main })
    })

    it('lets an explicit prop override context', () => {
      renderWithTheme(
        <FormControl disabled>
          <TextInput disabled={false} />
        </FormControl>
      )
      expect(screen.getByRole('textbox')).not.toBeDisabled()
    })

    it('inherits textColor from FormControl', () => {
      renderWithTheme(
        <FormControl textColor="info">
          <TextInput data-testid="root" />
        </FormControl>
      )
      expect(screen.getByTestId('root')).toHaveStyle({ color: dark.text.info })
    })
  })

  // ─── textColor ─────────────────────────────────────────────────────────────────

  describe('textColor', () => {
    it('defaults the text color to text.primary', () => {
      renderWithTheme(<TextInput data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ color: dark.text.primary })
    })

    it('applies an explicit textColor token to the text color', () => {
      renderWithTheme(<TextInput textColor="success" data-testid="root" />)
      expect(screen.getByTestId('root')).toHaveStyle({ color: dark.text.success })
    })
  })
})
