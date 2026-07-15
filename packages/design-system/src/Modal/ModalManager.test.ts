import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ModalManager, ariaHidden, type ManagedModal } from './ModalManager'

let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.append(container)
})

afterEach(() => {
  container.remove()
  document.body.removeAttribute('style')
  // Reset any viewport overrides applied by scroll-lock tests.
  Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
})

/** Creates a managed modal whose mount node lives inside `parent`. */
const makeModal = (parent: HTMLElement = container): ManagedModal => {
  const mount = document.createElement('div')
  const modalRef = document.createElement('div')
  parent.append(mount)
  return { mount, modalRef }
}

describe('ariaHidden', () => {
  it('sets aria-hidden when hiding', () => {
    const el = document.createElement('div')
    ariaHidden(el, true)
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('removes aria-hidden when revealing', () => {
    const el = document.createElement('div')
    el.setAttribute('aria-hidden', 'true')
    ariaHidden(el, false)
    expect(el.hasAttribute('aria-hidden')).toBe(false)
  })
})

describe('ModalManager — stacking', () => {
  it('returns incrementing indices and tracks the top modal', () => {
    const manager = new ModalManager()
    const first = makeModal()
    const second = makeModal()

    expect(manager.add(first, container)).toBe(0)
    expect(manager.add(second, container)).toBe(1)
    expect(manager.isTopModal(second)).toBe(true)
    expect(manager.isTopModal(first)).toBe(false)
  })

  it('returns the existing index when the same modal is added twice', () => {
    const manager = new ModalManager()
    const modal = makeModal()
    expect(manager.add(modal, container)).toBe(0)
    expect(manager.add(modal, container)).toBe(0)
  })

  it('isTopModal is false when no modals are open', () => {
    const manager = new ModalManager()
    expect(manager.isTopModal(makeModal())).toBe(false)
  })

  it('groups modals that share a container', () => {
    const manager = new ModalManager()
    const first = makeModal()
    const second = makeModal()
    manager.add(first, container)
    manager.add(second, container)
    // Removing the non-last modal keeps the container alive and reveals the next.
    const top = makeModal()
    manager.add(top, container)
    top.modalRef.setAttribute('aria-hidden', 'true')
    manager.remove(second)
    expect(manager.isTopModal(top)).toBe(true)
  })
})

describe('ModalManager — aria-hidden siblings', () => {
  it('hides background siblings and skips the mount and forbidden tags', () => {
    const sibling = document.createElement('section')
    const script = document.createElement('script')
    const hiddenInput = document.createElement('input')
    hiddenInput.setAttribute('type', 'hidden')
    container.append(sibling, script, hiddenInput)

    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)

    expect(sibling.getAttribute('aria-hidden')).toBe('true')
    expect(script.hasAttribute('aria-hidden')).toBe(false)
    expect(hiddenInput.hasAttribute('aria-hidden')).toBe(false)
    expect(modal.mount.hasAttribute('aria-hidden')).toBe(false)
  })

  it('leaves siblings visible when disableAriaHidden is set, and skips unhiding on removal', () => {
    const sibling = document.createElement('section')
    container.append(sibling)
    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container, true)
    expect(sibling.hasAttribute('aria-hidden')).toBe(false)
    manager.remove(modal)
    expect(sibling.hasAttribute('aria-hidden')).toBe(false)
  })

  it('restores siblings when a modal reuses a container first opened by a non-aria-hidden popover', () => {
    const sibling = document.createElement('section')
    container.append(sibling)
    const manager = new ModalManager()
    const popover = makeModal()
    const modal = makeModal()
    // A non-modal popover opens the container without hiding siblings.
    manager.add(popover, container, true)
    expect(sibling.hasAttribute('aria-hidden')).toBe(false)
    // A real modal reuses it — siblings get hidden and must be restored on teardown.
    manager.add(modal, container)
    expect(sibling.getAttribute('aria-hidden')).toBe('true')
    manager.remove(modal)
    manager.remove(popover)
    expect(sibling.hasAttribute('aria-hidden')).toBe(false)
  })

  it('leaves the container state intact when a disableAriaHidden popover stacks on a modal', () => {
    const sibling = document.createElement('section')
    container.append(sibling)
    const manager = new ModalManager()
    const modal = makeModal()
    const popover = makeModal()
    // The modal hides siblings; the stacked non-modal popover must not disturb that state.
    manager.add(modal, container)
    expect(sibling.getAttribute('aria-hidden')).toBe('true')
    manager.add(popover, container, true)
    manager.remove(popover)
    manager.remove(modal)
    expect(sibling.hasAttribute('aria-hidden')).toBe(false)
  })

  it('restores siblings when the last modal is removed', () => {
    const sibling = document.createElement('section')
    container.append(sibling)
    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.remove(modal)
    expect(sibling.hasAttribute('aria-hidden')).toBe(false)
  })

  it('leaves siblings that were already aria-hidden untouched on removal', () => {
    const sibling = document.createElement('section')
    sibling.setAttribute('aria-hidden', 'true')
    container.append(sibling)
    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.remove(modal)
    expect(sibling.getAttribute('aria-hidden')).toBe('true')
  })

  it('applies the requested aria-hidden state to the modal root on removal', () => {
    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.remove(modal, true)
    expect(modal.modalRef.getAttribute('aria-hidden')).toBe('true')
  })

  it('re-hides the removed modal and reveals the next when a modal remains', () => {
    const manager = new ModalManager()
    const lower = makeModal()
    const upper = makeModal()
    manager.add(lower, container)
    manager.add(upper, container)

    manager.remove(upper)
    // The removed modal is hidden (it may linger via shouldKeepMounted)…
    expect(upper.modalRef.getAttribute('aria-hidden')).toBe('true')
    // …and the modal below is revealed to assistive tech.
    expect(lower.modalRef.hasAttribute('aria-hidden')).toBe(false)
  })
})

describe('ModalManager — scroll lock', () => {
  it('pads the document body by the window scrollbar width, then restores', () => {
    // A window scrollbar: viewport wider than the document client area.
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1009,
      configurable: true,
    })
    const manager = new ModalManager()
    const modal = makeModal(document.body)
    manager.add(modal, document.body)
    manager.mount(modal, {})

    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe('15px') // 1024 - 1009

    manager.remove(modal)
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
  })

  it('pads a custom scrollable container by its own scrollbar gutter', () => {
    // jsdom does no layout, so fake the element metrics a real browser would report.
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true })
    Object.defineProperty(container, 'offsetWidth', { value: 515, configurable: true })
    Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true })
    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.mount(modal, {})

    expect(container.style.overflow).toBe('hidden')
    expect(container.style.paddingRight).toBe('15px') // offsetWidth - clientWidth

    manager.remove(modal)
    expect(container.style.overflow).toBe('')
    expect(container.style.paddingRight).toBe('')
  })

  it('restores pre-existing inline styles on removal', () => {
    container.style.overflow = 'scroll'
    container.style.paddingRight = '10px'
    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.mount(modal, {})
    manager.remove(modal)

    expect(container.style.overflow).toBe('scroll')
    expect(container.style.paddingRight).toBe('10px')
  })

  it('does not pad when the container is not overflowing', () => {
    Object.defineProperty(window, 'innerWidth', { value: 0, configurable: true })
    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.mount(modal, {})

    expect(container.style.overflow).toBe('hidden')
    expect(container.style.paddingRight).toBe('')
  })

  it('skips scroll lock when disableScrollLock is set', () => {
    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.mount(modal, { disableScrollLock: true })
    expect(container.style.overflow).toBe('')
    // Removal runs the no-op restore without touching styles.
    manager.remove(modal)
    expect(container.style.overflow).toBe('')
  })

  it('does not lock twice when mount is called again', () => {
    const manager = new ModalManager()
    const modal = makeModal()
    manager.add(modal, container)
    manager.mount(modal, {})
    container.style.removeProperty('overflow')
    manager.mount(modal, {})
    expect(container.style.overflow).toBe('')
  })
})

describe('ModalManager — remove guards', () => {
  it('returns -1 when removing a modal that was never added', () => {
    const manager = new ModalManager()
    expect(manager.remove(makeModal())).toBe(-1)
  })

  it('reveals the next modal down the stack when one of several is removed', () => {
    const manager = new ModalManager()
    const first = makeModal()
    const second = makeModal()
    manager.add(first, container)
    manager.add(second, container)
    first.modalRef.setAttribute('aria-hidden', 'true')

    manager.remove(second)

    expect(first.modalRef.hasAttribute('aria-hidden')).toBe(false)
  })
})
