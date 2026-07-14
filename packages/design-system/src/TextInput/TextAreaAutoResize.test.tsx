import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TextAreaAutoResize } from './TextAreaAutoResize'

const mockStyle = (overrides: Partial<CSSStyleDeclaration> = {}) =>
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    lineHeight: '20px',
    fontSize: '16px',
    paddingTop: '4px',
    paddingBottom: '4px',
    ...overrides,
  } as CSSStyleDeclaration)

const setScrollHeight = (value: number) =>
  Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => value,
  })

describe('TextAreaAutoResize', () => {
  beforeEach(() => {
    mockStyle()
    setScrollHeight(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── element ─────────────────────────────────────────────────────────────────

  describe('element', () => {
    it('renders a textarea', () => {
      render(<TextAreaAutoResize />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('passes rest props to textarea', () => {
      render(<TextAreaAutoResize placeholder="Type here" data-testid="ta" />)
      expect(screen.getByTestId('ta')).toHaveAttribute('placeholder', 'Type here')
    })
  })

  // ─── controlled ──────────────────────────────────────────────────────────────

  describe('controlled', () => {
    it('reflects value prop', () => {
      render(<TextAreaAutoResize value="hello" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('hello')
    })

    it('calls onChange on user input', () => {
      const onChange = vi.fn()
      render(<TextAreaAutoResize onChange={onChange} />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hi' } })
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('does not throw when onChange is not provided', () => {
      render(<TextAreaAutoResize />)
      expect(() =>
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hi' } })
      ).not.toThrow()
    })
  })

  // ─── forwardRef ───────────────────────────────────────────────────────────────

  describe('forwardRef', () => {
    it('forwards ref as object ref', () => {
      const ref = createRef<HTMLTextAreaElement>()
      render(<TextAreaAutoResize ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })

    it('forwards ref as function ref', () => {
      const fn = vi.fn()
      render(<TextAreaAutoResize ref={fn} />)
      expect(fn).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement))
    })
  })

  // ─── adjust: height ───────────────────────────────────────────────────────────

  describe('adjust', () => {
    it('sets height after mount', () => {
      render(<TextAreaAutoResize value="" onChange={() => {}} />)
      expect((screen.getByRole('textbox') as HTMLTextAreaElement).style.height).toBeTruthy()
    })

    it('adjusts height when value changes', () => {
      const { rerender } = render(<TextAreaAutoResize value="a" onChange={() => {}} />)
      rerender(<TextAreaAutoResize value="a\nb" onChange={() => {}} />)
      expect((screen.getByRole('textbox') as HTMLTextAreaElement).style.height).toBeTruthy()
    })

    it('adjusts height on user input via handleChange', () => {
      render(<TextAreaAutoResize minRows={2} />)
      const el = screen.getByRole('textbox') as HTMLTextAreaElement
      fireEvent.change(el, { target: { value: 'typed' } })
      expect(el.style.height).toBeTruthy()
    })

    it('enforces minRows as minimum height', () => {
      render(<TextAreaAutoResize value="" onChange={() => {}} minRows={3} />)
      const el = screen.getByRole('textbox') as HTMLTextAreaElement
      // lineHeight=20, paddingY=8 → min = 3×20+8 = 68px
      expect(parseFloat(el.style.height)).toBeGreaterThanOrEqual(68)
    })

    it('adjusts height when minRows changes', () => {
      const { rerender } = render(<TextAreaAutoResize value="" onChange={() => {}} minRows={1} />)
      rerender(<TextAreaAutoResize value="" onChange={() => {}} minRows={4} />)
      const el = screen.getByRole('textbox') as HTMLTextAreaElement
      // min = 4×20+8 = 88px
      expect(parseFloat(el.style.height)).toBeGreaterThanOrEqual(88)
    })

    it('caps height at maxRows and sets overflow to auto', () => {
      setScrollHeight(1000)
      render(<TextAreaAutoResize value="" onChange={() => {}} maxRows={2} />)
      const el = screen.getByRole('textbox') as HTMLTextAreaElement
      // max = 2×20+8 = 48px
      expect(parseFloat(el.style.height)).toBeCloseTo(48)
      expect(el.style.overflow).toBe('auto')
    })

    it('sets overflow to hidden when scrollHeight is within maxRows', () => {
      setScrollHeight(20)
      render(<TextAreaAutoResize value="" onChange={() => {}} maxRows={5} />)
      expect((screen.getByRole('textbox') as HTMLTextAreaElement).style.overflow).toBe('hidden')
    })

    it('falls back to fontSize×1.2 when lineHeight is not numeric', () => {
      vi.restoreAllMocks()
      mockStyle({ lineHeight: 'normal', fontSize: '16px', paddingTop: '0px', paddingBottom: '0px' })
      setScrollHeight(0)
      render(<TextAreaAutoResize value="" onChange={() => {}} minRows={1} />)
      const el = screen.getByRole('textbox') as HTMLTextAreaElement
      // fallback lineHeight = 16×1.2 = 19.2 → min = 19.2px
      expect(parseFloat(el.style.height)).toBeGreaterThanOrEqual(19)
    })
  })
})
