// jsdom has no Popover API - no showPopover / hidePopover, no `toggle` event, no Escape light
// dismiss, and none of the browser's popover styles. The design system's Drawer is an HTML
// popover, so unit tests get a minimal stand-in: the open state as a data attribute, a closed
// popover hidden like the browser hides it, and Escape closing the open ones.
const OPEN = 'data-popover-open'

const setOpen = (element: HTMLElement, open: boolean) => {
  if (element.hasAttribute(OPEN) === open) return
  element.toggleAttribute(OPEN, open)
  // jsdom doesn't restyle on an attribute change, so the open state also goes inline
  element.style.display = open ? 'block' : ''
  const [oldState, newState] = open ? ['closed', 'open'] : ['open', 'closed']
  element.dispatchEvent(Object.assign(new Event('toggle'), { oldState, newState }))
}

/** Installs the stand-in on the test document, unless the environment has the real API. */
export function installPopover() {
  // The DOM types always declare the API; at runtime jsdom leaves it out
  const proto: Partial<Pick<HTMLElement, 'showPopover' | 'hidePopover'>> = HTMLElement.prototype
  if (proto.showPopover) return

  proto.showPopover = function (this: HTMLElement) {
    setOpen(this, true)
  }
  proto.hidePopover = function (this: HTMLElement) {
    setOpen(this, false)
  }

  const style = document.createElement('style')
  style.textContent = `[popover]:not([${OPEN}]) { display: none; }`
  document.head.append(style)

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    document.querySelectorAll<HTMLElement>(`[popover][${OPEN}]`).forEach((el) => el.hidePopover())
  })
}
