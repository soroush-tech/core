import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { dark } from '../themes'
import { Switch } from '../Switch'

describe('Switch', () => {
  // ─── element ─────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders a switch input', () => {
      renderWithTheme(<Switch />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('renders a label as root element', () => {
      renderWithTheme(<Switch data-testid="sw" />)
      expect(screen.getByTestId('sw').tagName.toLowerCase()).toBe('label')
    })

    it('renders a track with sw-track class', () => {
      const { container } = renderWithTheme(<Switch />)
      expect(container.querySelector('.sw-track')).toBeInTheDocument()
    })

    it('renders a thumb with sw-thumb class', () => {
      const { container } = renderWithTheme(<Switch />)
      expect(container.querySelector('.sw-thumb')).toBeInTheDocument()
    })
  })

  // ─── controlled ──────────────────────────────────────────────────────────────

  describe('controlled', () => {
    it('reflects checked=true', () => {
      renderWithTheme(<Switch checked onChange={() => {}} />)
      expect(screen.getByRole('switch')).toBeChecked()
    })

    it('reflects checked=false', () => {
      renderWithTheme(<Switch checked={false} onChange={() => {}} />)
      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('calls onChange when clicked', () => {
      const onChange = vi.fn()
      renderWithTheme(<Switch checked onChange={onChange} />)
      fireEvent.click(screen.getByRole('switch'))
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  // ─── uncontrolled ─────────────────────────────────────────────────────────────

  describe('uncontrolled', () => {
    it('starts unchecked by default', () => {
      renderWithTheme(<Switch />)
      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('starts checked when defaultChecked=true', () => {
      renderWithTheme(<Switch defaultChecked />)
      expect(screen.getByRole('switch')).toBeChecked()
    })

    it('toggles on click', () => {
      renderWithTheme(<Switch />)
      const input = screen.getByRole('switch')
      fireEvent.click(input)
      expect(input).toBeChecked()
    })
  })

  // ─── disabled ─────────────────────────────────────────────────────────────────

  describe('disabled', () => {
    it('disables the input', () => {
      renderWithTheme(<Switch disabled />)
      expect(screen.getByRole('switch')).toBeDisabled()
    })

    it('does not call onChange when disabled', () => {
      const onChange = vi.fn()
      renderWithTheme(<Switch disabled onChange={onChange} />)
      fireEvent.change(screen.getByRole('switch'), { target: { checked: true } })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── onChange ─────────────────────────────────────────────────────────────────

  describe('onChange', () => {
    it('calls onChange when toggled', () => {
      const onChange = vi.fn()
      renderWithTheme(<Switch onChange={onChange} />)
      fireEvent.click(screen.getByRole('switch'))
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('passes the event to onChange', () => {
      const onChange = vi.fn()
      renderWithTheme(<Switch onChange={onChange} />)
      fireEvent.click(screen.getByRole('switch'))
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: expect.any(Object) }))
    })
  })

  // ─── keyboard ─────────────────────────────────────────────────────────────────

  describe('keyboard', () => {
    it('toggles on Enter', () => {
      renderWithTheme(<Switch />)
      const input = screen.getByRole('switch')
      input.focus()
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(input).toBeChecked()
    })

    it('calls onChange on Enter', () => {
      const onChange = vi.fn()
      renderWithTheme(<Switch checked onChange={onChange} />)
      fireEvent.keyDown(screen.getByRole('switch'), { key: 'Enter' })
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('ignores other keys', () => {
      renderWithTheme(<Switch />)
      const input = screen.getByRole('switch')
      fireEvent.keyDown(input, { key: 'a' })
      expect(input).not.toBeChecked()
    })
  })

  // ─── color ────────────────────────────────────────────────────────────────────

  describe('color', () => {
    it('resolves theme.palette[color].main for all color tokens', () => {
      const colors = [
        'default',
        'primary',
        'secondary',
        'success',
        'error',
        'info',
        'warning',
      ] as const
      colors.forEach((color) => {
        const { unmount } = renderWithTheme(<Switch color={color} data-testid="sw" />)
        expect(screen.getByTestId('sw')).toHaveStyle({ color: dark.palette[color].main })
        unmount()
      })
    })

    it('does not forward color to DOM', () => {
      renderWithTheme(<Switch color="primary" data-testid="sw" />)
      expect(screen.getByTestId('sw')).not.toHaveAttribute('color')
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────────────

  describe('size', () => {
    // outside: track element is a wrapper (height = thumbSize).
    // The visual pill lives in ::before (height = trackHeight).
    it('outside sm — track wrapper is 34×20px', () => {
      const { container } = renderWithTheme(<Switch size="sm" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({ width: '34px', height: '20px' })
    })

    it('outside md — track wrapper is 44×24px', () => {
      const { container } = renderWithTheme(<Switch size="md" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({ width: '44px', height: '24px' })
    })

    it('outside lg — track wrapper is 54×28px', () => {
      const { container } = renderWithTheme(<Switch size="lg" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({ width: '54px', height: '28px' })
    })

    // inside: track IS the full pill
    it('inside sm — track is 36×20px', () => {
      const { container } = renderWithTheme(<Switch variant="inside" size="sm" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({ width: '36px', height: '20px' })
    })

    it('inside md — track is 46×26px', () => {
      const { container } = renderWithTheme(<Switch variant="inside" size="md" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({ width: '46px', height: '26px' })
    })

    it('inside lg — track is 56×32px', () => {
      const { container } = renderWithTheme(<Switch variant="inside" size="lg" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({ width: '56px', height: '32px' })
    })

    it('does not forward size to DOM', () => {
      renderWithTheme(<Switch size="md" data-testid="sw" />)
      expect(screen.getByTestId('sw')).not.toHaveAttribute('size')
    })
  })

  // ─── edge ─────────────────────────────────────────────────────────────────────

  describe('edge', () => {
    it('edge="start" applies marginLeft: -8px', () => {
      renderWithTheme(<Switch edge="start" data-testid="sw" />)
      expect(screen.getByTestId('sw')).toHaveStyle({ marginLeft: '-8px' })
    })

    it('edge="end" applies marginRight: -8px', () => {
      renderWithTheme(<Switch edge="end" data-testid="sw" />)
      expect(screen.getByTestId('sw')).toHaveStyle({ marginRight: '-8px' })
    })

    it('does not forward edge to DOM', () => {
      renderWithTheme(<Switch edge="start" data-testid="sw" />)
      expect(screen.getByTestId('sw')).not.toHaveAttribute('edge')
    })
  })

  // ─── icons ────────────────────────────────────────────────────────────────────

  describe('icons', () => {
    it('places custom icon in .sw-icon span', () => {
      const { container } = renderWithTheme(<Switch icon={<span>off</span>} />)
      expect(container.querySelector('.sw-icon')).toHaveTextContent('off')
    })

    it('places custom checkedIcon in .sw-checked-icon span', () => {
      const { container } = renderWithTheme(<Switch checkedIcon={<span>on</span>} />)
      expect(container.querySelector('.sw-checked-icon')).toHaveTextContent('on')
    })

    it('renders no icon span when icon is not provided', () => {
      const { container } = renderWithTheme(<Switch />)
      expect(container.querySelector('.sw-icon')).not.toBeInTheDocument()
    })

    it('renders no checked-icon span when checkedIcon is not provided', () => {
      const { container } = renderWithTheme(<Switch />)
      expect(container.querySelector('.sw-checked-icon')).not.toBeInTheDocument()
    })
  })

  // ─── bg ──────────────────────────────────────────────────────────────────────

  describe('bg', () => {
    it('inside variant: applies theme.background[bg] as unchecked track color', () => {
      const { container } = renderWithTheme(<Switch variant="inside" bg="paper" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({
        backgroundColor: dark.background.paper,
      })
    })

    it('inside variant: defaults to theme.background.default when bg is not set', () => {
      const { container } = renderWithTheme(<Switch variant="inside" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({
        backgroundColor: dark.background.default,
      })
    })

    it('does not forward bg to DOM', () => {
      const { container } = renderWithTheme(<Switch bg="paper" />)
      expect(container.querySelector('.sw-track')).not.toHaveAttribute('bg')
    })
  })

  // ─── marked ───────────────────────────────────────────────────────────────────

  describe('marked', () => {
    it('outside + marked: injects default XMark and CheckMark icons', () => {
      const { container } = renderWithTheme(<Switch variant="outside" marked />)
      expect(container.querySelector('.sw-icon')).toBeInTheDocument()
      expect(container.querySelector('.sw-checked-icon')).toBeInTheDocument()
    })

    it('inside + marked: renders .sw-track-check and .sw-track-x SVG elements', () => {
      const { container } = renderWithTheme(<Switch variant="inside" marked />)
      expect(container.querySelector('.sw-track-check')).toBeInTheDocument()
      expect(container.querySelector('.sw-track-x')).toBeInTheDocument()
      expect(container.querySelector('.sw-icon')).not.toBeInTheDocument()
      expect(container.querySelector('.sw-checked-icon')).not.toBeInTheDocument()
    })

    it('outside + marked: custom icon overrides default XMark', () => {
      const { container } = renderWithTheme(
        <Switch variant="outside" marked icon={<span>x</span>} />
      )
      expect(container.querySelector('.sw-icon')).toHaveTextContent('x')
    })

    it('outside + marked: custom checkedIcon overrides default CheckMark', () => {
      const { container } = renderWithTheme(
        <Switch variant="outside" marked checkedIcon={<span>ok</span>} />
      )
      expect(container.querySelector('.sw-checked-icon')).toHaveTextContent('ok')
    })
  })

  // ─── children ─────────────────────────────────────────────────────────────────

  describe('children', () => {
    it('renders label text', () => {
      renderWithTheme(<Switch>Enable notifications</Switch>)
      expect(screen.getByText('Enable notifications')).toBeInTheDocument()
    })

    it('renders no extra span when children is null', () => {
      const { container } = renderWithTheme(<Switch />)
      // Only the track span — no children span
      expect(container.querySelectorAll('label > span')).toHaveLength(1)
    })
  })

  // ─── form attributes ──────────────────────────────────────────────────────────

  describe('form attributes', () => {
    it('forwards id to the input', () => {
      renderWithTheme(<Switch id="my-switch" />)
      expect(screen.getByRole('switch')).toHaveAttribute('id', 'my-switch')
    })

    it('forwards required to the input', () => {
      renderWithTheme(<Switch required />)
      expect(screen.getByRole('switch')).toBeRequired()
    })
  })

  // ─── variant ─────────────────────────────────────────────────────────────────

  describe('variant', () => {
    it('outside — default variant', () => {
      const { container } = renderWithTheme(<Switch />)
      // outside track wrapper height equals thumb size (OUTSIDE_THUMB.md = 24px)
      expect(container.querySelector('.sw-track')).toHaveStyle({ height: '24px' })
    })

    it('inside — track is the full pill', () => {
      const { container } = renderWithTheme(<Switch variant="inside" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({ width: '46px', height: '26px' })
    })

    it('size prop works for inside variant', () => {
      const { container } = renderWithTheme(<Switch variant="inside" size="sm" />)
      expect(container.querySelector('.sw-track')).toHaveStyle({ width: '36px', height: '20px' })
    })

    it('does not forward variant to DOM', () => {
      renderWithTheme(<Switch variant="inside" data-testid="sw" />)
      expect(screen.getByTestId('sw')).not.toHaveAttribute('variant')
    })
  })

  // ─── accessibility ────────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="switch" on the input', () => {
      renderWithTheme(<Switch />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('forwards aria-label to the input', () => {
      renderWithTheme(<Switch aria-label="Toggle feature" />)
      expect(screen.getByRole('switch', { name: 'Toggle feature' })).toBeInTheDocument()
    })

    it('forwards className to the root', () => {
      renderWithTheme(<Switch className="custom" data-testid="sw" />)
      expect(screen.getByTestId('sw')).toHaveClass('custom')
    })
  })
})
