import { describe, it, expect, afterEach } from 'vitest'
import { ModalManager, type ManagedModal } from './ModalManager'

// Scroll-lock math depends on real layout (scrollHeight / offsetWidth), which jsdom
// can't produce — these run in headless Chromium where the box metrics are real.

const makeModal = (): ManagedModal => ({
  mount: document.createElement('div'),
  modalRef: document.createElement('div'),
})

const makeScrollable = (overflowing: boolean): HTMLElement => {
  const el = document.createElement('div')
  el.setAttribute('data-test-container', '')
  Object.assign(el.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '200px',
    height: '200px',
    overflowY: 'auto',
  })
  const content = document.createElement('div')
  content.style.height = overflowing ? '1000px' : '50px'
  el.append(content)
  document.body.append(el)
  return el
}

afterEach(() => {
  document.body.removeAttribute('style')
  document.querySelectorAll('[data-test-container]').forEach((el) => el.remove())
})

describe('ModalManager scroll lock (real layout)', () => {
  it('pads an overflowing custom container by its real scrollbar gutter, then restores', () => {
    const container = makeScrollable(true)
    // Real overflow is detected from the element's own metrics.
    expect(container.scrollHeight).toBeGreaterThan(container.clientHeight)
    const gutter = container.offsetWidth - container.clientWidth

    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.mount(modal, {})

    expect(container.style.overflow).toBe('hidden')
    // Padding compensates for the element's own scrollbar, not the window's.
    expect(container.style.paddingRight).toBe(`${gutter}px`)

    manager.remove(modal)
    expect(container.style.overflow).toBe('')
    expect(container.style.paddingRight).toBe('')
  })

  it('does not pad a non-overflowing custom container', () => {
    const container = makeScrollable(false)
    expect(container.scrollHeight).toBeLessThanOrEqual(container.clientHeight)

    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.mount(modal, {})

    expect(container.style.overflow).toBe('hidden')
    expect(container.style.paddingRight).toBe('')

    manager.remove(modal)
  })

  it('pads the document body from the window scrollbar when the viewport overflows', () => {
    // Force a real vertical scrollbar on the document.
    const filler = document.createElement('div')
    filler.setAttribute('data-test-container', '')
    filler.style.height = '5000px'
    document.body.append(filler)
    const hasWindowScrollbar = window.innerWidth > document.documentElement.clientWidth

    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, document.body)
    manager.mount(modal, {})

    expect(document.body.style.overflow).toBe('hidden')
    // Whether the platform shows a classic scrollbar or not, padding is applied
    // only when one actually occupies space.
    if (hasWindowScrollbar) {
      expect(document.body.style.paddingRight).not.toBe('')
    }

    manager.remove(modal)
    expect(document.body.style.overflow).toBe('')
  })
})
