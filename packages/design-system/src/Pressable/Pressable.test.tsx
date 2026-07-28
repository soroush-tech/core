import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '@soroush.tech/design-system/utils/test/renderWithTheme'
import { ThemeProvider, baseTheme, createTheme } from '@soroush.tech/design-system/theme'
import { alpha } from '@soroush.tech/design-system/utils'
import { Pressable } from './Pressable'

/**
 * Emitted CSS rules that target one of the element's classes and contain the given
 * selector fragment (`''` matches them all). jsdom never enters `:active` or
 * `:focus-visible`, and it resolves keywords like `inherit` away in
 * `getComputedStyle`, so the generated stylesheet is the only place those
 * declarations can be observed.
 */
const rulesFor = (element: HTMLElement, pseudo: string) => {
  const css = Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('')
  const classes = Array.from(element.classList)
  return (css.match(/[^{}]+\{[^{}]*\}/g) ?? [])
    .filter((rule) => rule.includes(pseudo) && classes.some((name) => rule.includes(`.${name}`)))
    .join('')
}

describe('Pressable', () => {
  it('renders a div that is announced and focusable as a button', () => {
    renderWithTheme(<Pressable>Open</Pressable>)
    const pressable = screen.getByRole('button', { name: 'Open' })
    expect(pressable.tagName).toBe('DIV')
    expect(pressable).toHaveAttribute('tabindex', '0')
    // Attributes only a native button understands must not leak onto the div.
    expect(pressable).not.toHaveAttribute('type')
    expect(pressable).not.toHaveAttribute('disabled')
  })

  it('renders a native button with as="button", without the shim', () => {
    renderWithTheme(<Pressable as="button">Open</Pressable>)
    const pressable = screen.getByRole('button', { name: 'Open' })
    expect(pressable.tagName).toBe('BUTTON')
    expect(pressable).toHaveAttribute('type', 'button')
    // The browser already handles these — no redundant role or tab stop.
    expect(pressable).not.toHaveAttribute('role')
    expect(pressable).not.toHaveAttribute('tabindex')
  })

  it('renders any other element on request, still shimmed', () => {
    renderWithTheme(<Pressable as="span">Open</Pressable>)
    const pressable = screen.getByRole('button', { name: 'Open' })
    expect(pressable.tagName).toBe('SPAN')
    expect(pressable).toHaveAttribute('tabindex', '0')
  })

  it('lets an explicit type override the native button default', () => {
    renderWithTheme(
      <Pressable as="button" type="submit">
        Save
      </Pressable>
    )
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('strips the native button chrome so it adds no layout of its own', () => {
    renderWithTheme(<Pressable>Bare</Pressable>)
    const pressable = screen.getByRole('button')
    expect(pressable).toHaveStyle({ margin: '0px', padding: '0px', cursor: 'pointer' })
    const css = rulesFor(pressable, '')
    expect(css).toContain('border:none')
    expect(css).toContain('border-radius:0')
    expect(css).toContain('background-color:transparent')
    expect(css).toContain('color:inherit')
    expect(css).toContain('font:inherit')
    expect(css).toContain('text-align:inherit')
  })

  it('is not text-selectable, the way a native button is not', () => {
    // Without this a shimmed div would select its label on double-click or drag.
    renderWithTheme(<Pressable>Bare</Pressable>)
    const css = rulesFor(screen.getByRole('button'), '')
    expect(css).toContain('user-select:none')
    // Emotion's prefixer has to emit the WebKit form for Safari.
    expect(css).toContain('-webkit-user-select:none')
  })

  it('fires onClick when pressed', () => {
    const onClick = vi.fn()
    renderWithTheme(<Pressable onClick={onClick}>Go</Pressable>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('activates on Enter and on Space release', () => {
    const onClick = vi.fn()
    renderWithTheme(<Pressable onClick={onClick}>Go</Pressable>)
    const pressable = screen.getByRole('button')

    fireEvent.keyDown(pressable, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)

    // Space must not fire on keydown — that is where the page scroll is blocked.
    fireEvent.keyDown(pressable, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(1)
    fireEvent.keyUp(pressable, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('ignores keys that do not activate a button', () => {
    const onClick = vi.fn()
    renderWithTheme(<Pressable onClick={onClick}>Go</Pressable>)
    const pressable = screen.getByRole('button')
    fireEvent.keyDown(pressable, { key: 'a' })
    fireEvent.keyUp(pressable, { key: 'a' })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('chains consumer key handlers alongside the shim', () => {
    const onKeyDown = vi.fn()
    const onKeyUp = vi.fn()
    renderWithTheme(
      <Pressable onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
        Go
      </Pressable>
    )
    const pressable = screen.getByRole('button')
    fireEvent.keyDown(pressable, { key: 'Enter' })
    fireEvent.keyUp(pressable, { key: ' ' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onKeyUp).toHaveBeenCalledTimes(1)
  })

  it('leaves key handling to the browser on a native button', () => {
    const onKeyDown = vi.fn()
    renderWithTheme(
      <Pressable as="button" onKeyDown={onKeyDown}>
        Go
      </Pressable>
    )
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  describe('disabled', () => {
    it('blocks pointer and keyboard activation on the shimmed element', () => {
      const onClick = vi.fn()
      renderWithTheme(
        <Pressable disabled onClick={onClick}>
          Go
        </Pressable>
      )
      const pressable = screen.getByRole('button')
      expect(pressable).toHaveAttribute('aria-disabled', 'true')
      expect(pressable).toHaveAttribute('tabindex', '-1')

      fireEvent.click(pressable)
      fireEvent.keyDown(pressable, { key: 'Enter' })
      fireEvent.keyUp(pressable, { key: ' ' })
      expect(onClick).not.toHaveBeenCalled()
    })

    it('uses the native disabled attribute on a native button', () => {
      const onClick = vi.fn()
      renderWithTheme(
        <Pressable as="button" disabled onClick={onClick}>
          Go
        </Pressable>
      )
      const pressable = screen.getByRole('button')
      expect(pressable).toBeDisabled()
      expect(pressable).not.toHaveAttribute('aria-disabled')
      fireEvent.click(pressable)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('emits no press feedback while disabled', () => {
      renderWithTheme(
        <Pressable feedback="highlight" disabled>
          Go
        </Pressable>
      )
      expect(rulesFor(screen.getByRole('button'), ':active')).toBe('')
    })
  })

  it('renders an anchor without a type attribute when href is set', () => {
    renderWithTheme(<Pressable href="/docs">Docs</Pressable>)
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('href', '/docs')
    expect(link).not.toHaveAttribute('type')
    expect(link).toHaveStyle({ textDecoration: 'none' })
  })

  it('applies spacing, layout, and border props on top of the reset', () => {
    renderWithTheme(
      <Pressable p={2} width="10rem" borderRadius="md">
        Padded
      </Pressable>
    )
    expect(screen.getByRole('button')).toHaveStyle({
      padding: baseTheme.space[2],
      width: '10rem',
      borderRadius: baseTheme.radii.md,
    })
  })

  it('forwards HTML attributes without leaking custom props to the DOM', () => {
    renderWithTheme(
      <Pressable feedback="opacity" activeOpacity={0.4} aria-label="row" data-testid="row">
        Row
      </Pressable>
    )
    const pressable = screen.getByTestId('row')
    expect(pressable).toHaveAttribute('aria-label', 'row')
    expect(pressable).not.toHaveAttribute('feedback')
    expect(pressable).not.toHaveAttribute('activeOpacity')
    expect(pressable).not.toHaveAttribute('color')
  })

  it('draws a keyboard-only focus ring', () => {
    renderWithTheme(<Pressable>Focus</Pressable>)
    const pressable = screen.getByRole('button')
    expect(pressable).toHaveStyle({ outline: 'none' })
    expect(rulesFor(pressable, ':focus-visible')).toContain(
      `outline:2px solid ${baseTheme.palette.primary.main}`
    )
  })

  describe('feedback', () => {
    it('emits no press rule by default', () => {
      renderWithTheme(<Pressable>Plain</Pressable>)
      expect(rulesFor(screen.getByRole('button'), ':active')).toBe('')
    })

    it('dims the content while held under the opacity feedback', () => {
      renderWithTheme(<Pressable feedback="opacity">Dim</Pressable>)
      expect(rulesFor(screen.getByRole('button'), ':active')).toContain('opacity:0.7')
    })

    it('honors a custom activeOpacity', () => {
      renderWithTheme(
        <Pressable feedback="opacity" activeOpacity={0.3}>
          Dim
        </Pressable>
      )
      expect(rulesFor(screen.getByRole('button'), ':active')).toContain('opacity:0.3')
    })

    it('tints the surface while held under the highlight feedback', () => {
      renderWithTheme(<Pressable feedback="highlight">Tint</Pressable>)
      expect(rulesFor(screen.getByRole('button'), ':active')).toContain(
        `background-color:${alpha(baseTheme.palette.primary.main, 0.125)}`
      )
    })

    it('derives the highlight tint from the requested palette color', () => {
      renderWithTheme(
        <Pressable feedback="highlight" color="secondary">
          Tint
        </Pressable>
      )
      expect(rulesFor(screen.getByRole('button'), ':active')).toContain(
        `background-color:${alpha(baseTheme.palette.secondary.main, 0.125)}`
      )
    })
  })

  describe('theme defaults', () => {
    it('takes feedback, color, and activeOpacity from theme.components defaultProps', () => {
      const theme = createTheme(baseTheme, {
        components: {
          Pressable: {
            defaultProps: { feedback: 'highlight', color: 'error', activeOpacity: 0.2 },
          },
        },
      })
      render(
        <ThemeProvider theme={theme}>
          <Pressable>Themed</Pressable>
        </ThemeProvider>
      )
      expect(rulesFor(screen.getByRole('button'), ':active')).toContain(
        `background-color:${alpha(baseTheme.palette.error.main, 0.125)}`
      )
    })

    it('lets an explicit prop beat the theme default', () => {
      const theme = createTheme(baseTheme, {
        components: { Pressable: { defaultProps: { feedback: 'highlight', activeOpacity: 0.2 } } },
      })
      render(
        <ThemeProvider theme={theme}>
          <Pressable feedback="opacity" activeOpacity={0.9}>
            Themed
          </Pressable>
        </ThemeProvider>
      )
      expect(rulesFor(screen.getByRole('button'), ':active')).toContain('opacity:0.9')
    })
  })
})
