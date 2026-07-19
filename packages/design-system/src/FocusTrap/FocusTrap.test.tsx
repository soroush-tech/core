import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ThemeProvider } from '../theme'
import { createTheme, baseTheme } from '../theme/themes'
import { FocusTrap } from './'

afterEach(cleanup)

describe('FocusTrap — theme customization', () => {
  it('applies theme.components.FocusTrap.styleOverrides.root to the wrapper', () => {
    const theme = createTheme(baseTheme, {
      components: { FocusTrap: { styleOverrides: { root: { display: 'contents' } } } },
    })
    render(
      <ThemeProvider theme={theme}>
        <FocusTrap>
          <button data-testid="inner">in</button>
        </FocusTrap>
      </ThemeProvider>
    )
    const wrapper = screen.getByTestId('inner').parentElement
    expect(wrapper).toHaveStyle({ display: 'contents', outline: 'none' })
  })
})

/** Focuses a detached trigger button so focus restoration can be observed. */
const focusTrigger = () => {
  const trigger = document.createElement('button')
  trigger.textContent = 'trigger'
  document.body.append(trigger)
  trigger.focus()
  return trigger
}

describe('FocusTrap — activation', () => {
  it('moves focus to the first focusable child on activation', () => {
    render(
      <FocusTrap>
        <div>
          <button data-testid="b1">one</button>
          <button data-testid="b2">two</button>
        </div>
      </FocusTrap>
    )
    expect(screen.getByTestId('b1')).toHaveFocus()
  })

  it('focuses the trap container when there are no focusable children', () => {
    render(
      <FocusTrap>
        <span data-testid="text">no focusables</span>
      </FocusTrap>
    )
    expect(screen.getByTestId('text').parentElement).toHaveFocus()
  })

  it('does not move focus when shouldAutoFocus is false', () => {
    const trigger = focusTrigger()
    render(
      <FocusTrap shouldAutoFocus={false}>
        <button data-testid="b">x</button>
      </FocusTrap>
    )
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('is inert when isEnabled is false', () => {
    const trigger = focusTrigger()
    render(
      <FocusTrap isEnabled={false}>
        <button data-testid="b">x</button>
      </FocusTrap>
    )
    expect(trigger).toHaveFocus()
    // The key handler also bails out while disabled.
    fireEvent.keyDown(screen.getByTestId('b'), { key: 'Tab', shiftKey: true })
    expect(trigger).toHaveFocus()
    trigger.remove()
  })
})

describe('FocusTrap — restore', () => {
  it('restores focus to the previously focused element on unmount', () => {
    const trigger = focusTrigger()
    const { unmount } = render(
      <FocusTrap>
        <button data-testid="b">x</button>
      </FocusTrap>
    )
    expect(screen.getByTestId('b')).toHaveFocus()
    unmount()
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('does not restore focus when shouldRestoreFocus is false', () => {
    const trigger = focusTrigger()
    const { unmount } = render(
      <FocusTrap shouldRestoreFocus={false}>
        <button data-testid="b">x</button>
      </FocusTrap>
    )
    unmount()
    expect(trigger).not.toHaveFocus()
    trigger.remove()
  })
})

describe('FocusTrap — enforce focus', () => {
  it('pulls focus back to the first focusable when it escapes the trap', () => {
    render(
      <FocusTrap>
        <button data-testid="b1">1</button>
      </FocusTrap>
    )
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    expect(screen.getByTestId('b1')).toHaveFocus()
    outside.remove()
  })

  it('does not pull focus back when shouldEnforceFocus is false', () => {
    render(
      <FocusTrap shouldEnforceFocus={false}>
        <button data-testid="b1">1</button>
      </FocusTrap>
    )
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    expect(outside).toHaveFocus()
    outside.remove()
  })
})

describe('FocusTrap — tab cycling', () => {
  const renderThree = () =>
    render(
      <FocusTrap>
        <div>
          <button data-testid="b1">1</button>
          <button data-testid="b2">2</button>
          <button data-testid="b3">3</button>
        </div>
      </FocusTrap>
    )

  it('wraps Shift+Tab from the first element to the last', () => {
    renderThree()
    fireEvent.keyDown(screen.getByTestId('b1'), { key: 'Tab', shiftKey: true })
    expect(screen.getByTestId('b3')).toHaveFocus()
  })

  it('wraps Tab from the last element to the first', () => {
    renderThree()
    screen.getByTestId('b3').focus()
    fireEvent.keyDown(screen.getByTestId('b3'), { key: 'Tab' })
    expect(screen.getByTestId('b1')).toHaveFocus()
  })

  it('does nothing when Tab is pressed away from a boundary', () => {
    renderThree()
    screen.getByTestId('b2').focus()
    fireEvent.keyDown(screen.getByTestId('b2'), { key: 'Tab' })
    expect(screen.getByTestId('b2')).toHaveFocus()
  })

  it('does nothing when Shift+Tab is pressed away from the first element', () => {
    renderThree()
    screen.getByTestId('b2').focus()
    fireEvent.keyDown(screen.getByTestId('b2'), { key: 'Tab', shiftKey: true })
    expect(screen.getByTestId('b2')).toHaveFocus()
  })

  it('ignores non-Tab keys', () => {
    renderThree()
    fireEvent.keyDown(screen.getByTestId('b1'), { key: 'Enter' })
    expect(screen.getByTestId('b1')).toHaveFocus()
  })

  it('does not trap when shouldTrapFocus is false', () => {
    render(
      <FocusTrap shouldTrapFocus={false}>
        <div>
          <button data-testid="b1">1</button>
          <button data-testid="b2">2</button>
        </div>
      </FocusTrap>
    )
    fireEvent.keyDown(screen.getByTestId('b1'), { key: 'Tab', shiftKey: true })
    expect(screen.getByTestId('b1')).toHaveFocus()
  })

  it('prevents default Tab when there are no focusable children', () => {
    render(
      <FocusTrap>
        <span data-testid="text">x</span>
      </FocusTrap>
    )
    const container = screen.getByTestId('text').parentElement as HTMLElement
    // fireEvent returns false when the handler called preventDefault().
    const notPrevented = fireEvent.keyDown(container, { key: 'Tab' })
    expect(notPrevented).toBe(false)
    expect(container).toHaveFocus()
  })

  it('skips tabindex="-1" elements when moving focus', () => {
    render(
      <FocusTrap>
        <div>
          <button tabIndex={-1} data-testid="skip">
            skip
          </button>
          <button data-testid="real">real</button>
        </div>
      </FocusTrap>
    )
    expect(screen.getByTestId('real')).toHaveFocus()
  })
})
