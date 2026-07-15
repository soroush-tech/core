import { ownerWindow } from '../utils/ownerWindow'
import { ownerDocument } from '../utils/ownerDocument'
import { getScrollbarSize } from './utils/getScrollbarSize'

/** A modal tracked by the manager: its portal mount node and its root element. */
export interface ManagedModal {
  mount: Element
  modalRef: Element
}

export interface ManagedModalProps {
  disableScrollLock?: boolean
}

interface ContainerState {
  container: HTMLElement
  modals: ManagedModal[]
  /** Undoes the scroll-lock styles; `null` until the container is mounted. */
  restore: (() => void) | null
  /** Siblings already `aria-hidden` before this container opened — left untouched. */
  hiddenSiblings: Element[]
  /** Whether background siblings were `aria-hidden` for this container (skipped for non-modal popovers). */
  ariaHiddenApplied: boolean
}

// Tags that can be children of <body> but cannot carry aria-hidden per the ARIA spec.
const ARIA_HIDDEN_FORBIDDEN_TAGS = new Set([
  'TEMPLATE',
  'SCRIPT',
  'STYLE',
  'LINK',
  'MAP',
  'META',
  'NOSCRIPT',
  'PICTURE',
  'COL',
  'COLGROUP',
  'PARAM',
  'SLOT',
  'SOURCE',
  'TRACK',
])

export function ariaHidden(element: Element, hide: boolean): void {
  if (hide) {
    element.setAttribute('aria-hidden', 'true')
  } else {
    element.removeAttribute('aria-hidden')
  }
}

function isAriaHiddenForbidden(element: Element): boolean {
  if (ARIA_HIDDEN_FORBIDDEN_TAGS.has(element.tagName)) {
    return true
  }
  return element.tagName === 'INPUT' && element.getAttribute('type') === 'hidden'
}

function ariaHiddenSiblings(
  container: Element,
  mountElement: Element,
  currentElement: Element,
  hiddenSiblings: Element[],
  hide: boolean
): void {
  const exclude = new Set([mountElement, currentElement, ...hiddenSiblings])
  Array.from(container.children).forEach((element) => {
    if (!exclude.has(element) && !isAriaHiddenForbidden(element)) {
      ariaHidden(element, hide)
    }
  })
}

function getHiddenSiblings(container: Element): Element[] {
  return Array.from(container.children).filter(
    (element) => element.getAttribute('aria-hidden') === 'true'
  )
}

function isOverflowing(container: HTMLElement): boolean {
  const doc = ownerDocument(container)
  // The document/body scrolls the viewport, so compare against the window; a custom
  // scrollable container is measured by its own content vs. visible height.
  if (container === doc.body) {
    return ownerWindow(container).innerWidth > doc.documentElement.clientWidth
  }
  return container.scrollHeight > container.clientHeight
}

function getPaddingRight(element: Element): number {
  return Number.parseFloat(ownerWindow(element).getComputedStyle(element).paddingRight) || 0
}

/**
 * Locks scrolling on the container, padding it by the scrollbar width so hiding
 * the scrollbar causes no horizontal layout shift. Returns a function that
 * restores the exact prior inline styles.
 */
function lockScroll(container: HTMLElement): () => void {
  const restores: Array<() => void> = []

  const setStyle = (property: string, value: string) => {
    const previous = container.style.getPropertyValue(property)
    restores.push(() => {
      if (previous) {
        container.style.setProperty(property, previous)
      } else {
        container.style.removeProperty(property)
      }
    })
    container.style.setProperty(property, value)
  }

  if (isOverflowing(container)) {
    // Body hides the window scrollbar; a custom container hides its own gutter.
    const scrollbarSize =
      container === ownerDocument(container).body
        ? getScrollbarSize(ownerWindow(container))
        : container.offsetWidth - container.clientWidth
    setStyle('padding-right', `${getPaddingRight(container) + scrollbarSize}px`)
  }
  setStyle('overflow', 'hidden')

  return () => restores.forEach((restore) => restore())
}

/**
 * Tracks every open modal and the containers they live in. A single shared
 * instance coordinates stacking (`isTopModal`), scroll-lock, and `aria-hidden`
 * on background siblings so assistive tech only sees the active modal.
 */
export class ModalManager {
  private readonly modals: ManagedModal[] = []
  private readonly containers: ContainerState[] = []

  add(modal: ManagedModal, container: HTMLElement, disableAriaHidden = false): number {
    const existingIndex = this.modals.indexOf(modal)
    if (existingIndex !== -1) {
      return existingIndex
    }

    const modalIndex = this.modals.length
    this.modals.push(modal)

    ariaHidden(modal.modalRef, false)

    const hiddenSiblings = getHiddenSiblings(container)
    // A non-modal popover (e.g. a select's listbox) must not hide the page — its
    // trigger stays focused and controls the listbox via `aria-activedescendant`.
    if (!disableAriaHidden) {
      ariaHiddenSiblings(container, modal.mount, modal.modalRef, hiddenSiblings, true)
    }

    const containerState = this.containers.find((item) => item.container === container)
    if (containerState) {
      containerState.modals.push(modal)
      // This modal hid the siblings above, so `remove` must later restore them.
      if (!disableAriaHidden) {
        containerState.ariaHiddenApplied = true
      }
      return modalIndex
    }

    this.containers.push({
      container,
      modals: [modal],
      restore: null,
      hiddenSiblings,
      ariaHiddenApplied: !disableAriaHidden,
    })

    return modalIndex
  }

  mount(modal: ManagedModal, props: ManagedModalProps): void {
    const containerState = this.containers.find((item) => item.modals.includes(modal))!
    containerState.restore ??= props.disableScrollLock
      ? () => {}
      : lockScroll(containerState.container)
  }

  remove(modal: ManagedModal, ariaHiddenState = true): number {
    const modalIndex = this.modals.indexOf(modal)
    if (modalIndex === -1) {
      return modalIndex
    }

    const containerState = this.containers.find((item) => item.modals.includes(modal))!
    containerState.modals.splice(containerState.modals.indexOf(modal), 1)
    this.modals.splice(modalIndex, 1)

    if (containerState.modals.length === 0) {
      if (containerState.restore) {
        containerState.restore()
      }
      ariaHidden(modal.modalRef, ariaHiddenState)
      if (containerState.ariaHiddenApplied) {
        ariaHiddenSiblings(
          containerState.container,
          modal.mount,
          modal.modalRef,
          containerState.hiddenSiblings,
          false
        )
      }
      this.containers.splice(this.containers.indexOf(containerState), 1)
    } else {
      // Re-hide the modal being removed (it may linger via `shouldKeepMounted`) and
      // reveal the next modal down the stack to assistive tech. The modal roots are
      // portaled directly into the container, so revealing the sibling below is enough.
      const nextTop = containerState.modals.at(-1)!
      ariaHidden(modal.modalRef, ariaHiddenState)
      ariaHidden(nextTop.modalRef, false)
    }

    return modalIndex
  }

  isTopModal(modal: ManagedModal): boolean {
    return this.modals.at(-1) === modal
  }
}
