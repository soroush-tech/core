import { fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { installPopover } from './popover'

// setupTests.ts has already installed the stand-in on this document.
const makePopover = () => {
  const element = document.createElement('div')
  element.setAttribute('popover', 'auto')
  document.body.append(element)
  return element
}

describe('installPopover', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps an installed API (it is safe to call twice)', () => {
    const { showPopover } = HTMLElement.prototype
    installPopover()
    expect(HTMLElement.prototype.showPopover).toBe(showPopover)
  })

  it('hides a closed popover and shows an open one', () => {
    const popover = makePopover()
    expect(popover).not.toBeVisible()
    popover.showPopover()
    expect(popover).toBeVisible()
    popover.hidePopover()
    expect(popover).not.toBeVisible()
  })

  it('fires toggle with the old and new state, once per change', () => {
    const popover = makePopover()
    const onToggle = vi.fn()
    popover.addEventListener('toggle', onToggle)
    popover.showPopover()
    popover.showPopover()
    popover.hidePopover()
    expect(onToggle.mock.calls.map(([event]) => [event.oldState, event.newState])).toEqual([
      ['closed', 'open'],
      ['open', 'closed'],
    ])
  })

  it('closes open popovers on Escape and ignores other keys', () => {
    const popover = makePopover()
    popover.showPopover()
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(popover).toBeVisible()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(popover).not.toBeVisible()
  })
})
