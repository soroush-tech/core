import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { Modal } from './'

// jsdom has no layout and ignores `pointer-events` for hit-testing, so the
// scroll="body" pass-through behaviour can only be verified in a real browser.

const getRoot = () => document.querySelector('[role="presentation"]') as HTMLElement

describe('Modal scroll="body" (real layout)', () => {
  it('lets pointer events pass through the backdrop to the scrollable root', () => {
    renderWithTheme(
      <Modal isOpen scroll="body">
        <div data-testid="paper" style={{ width: '300px', height: '3000px', background: '#fff' }}>
          tall content
        </div>
      </Modal>
    )
    const root = getRoot()
    const backdrop = root.querySelector('[aria-hidden="true"]') as HTMLElement

    // The scrim is purely visual.
    expect(getComputedStyle(backdrop).pointerEvents).toBe('none')
    // The root is the scroll container and the tall content overflows it.
    expect(root.scrollHeight).toBeGreaterThan(root.clientHeight)
    // Hit-testing the dimmed corner skips the (pointer-events:none) backdrop and
    // lands on the root, so a wheel there scrolls the modal, not the locked viewport.
    const hit = document.elementFromPoint(5, 5)
    expect(hit).not.toBe(backdrop)
    expect(hit).toBe(root)
  })
})
