/**
 * Width of the vertical scrollbar for the given window, in pixels. Equal to the
 * gap between the inner window width and the document's client width. Used to
 * pad the container when scroll-lock hides the scrollbar, preventing layout jump.
 */
export function getScrollbarSize(win: Window): number {
  const documentWidth = win.document.documentElement.clientWidth
  return Math.abs(win.innerWidth - documentWidth)
}
