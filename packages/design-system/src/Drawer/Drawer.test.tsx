import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, cleanup } from '@testing-library/react'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../themes'
import { Drawer, type DrawerAnchor } from './'

const getPanel = () => screen.getByTestId('content').parentElement as HTMLElement
const getRoot = () => document.querySelector('[role="presentation"]') as HTMLElement

afterEach(() => {
  cleanup()
  document.body.removeAttribute('style')
})

const renderDrawer = (props: Partial<React.ComponentProps<typeof Drawer>> = {}) =>
  renderWithTheme(
    <Drawer isOpen {...props}>
      <div data-testid="content">x</div>
    </Drawer>
  )

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    renderWithTheme(
      <Drawer isOpen={false}>
        <div data-testid="content">x</div>
      </Drawer>
    )
    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('renders the panel fixed to the viewport when open', () => {
    renderDrawer()
    expect(getPanel()).toHaveStyle({ position: 'fixed' })
  })

  it('layers the root on the drawer stacking layer (below modals)', () => {
    renderDrawer()
    expect(getRoot()).toHaveStyle({ zIndex: baseTheme.zOrder.drawer })
  })

  it('anchors to the left edge by default (full height)', () => {
    renderDrawer()
    expect(getPanel()).toHaveStyle({ left: '0px', height: '100%' })
  })

  it('anchors to the right edge', () => {
    renderDrawer({ anchor: 'right' })
    expect(getPanel()).toHaveStyle({ right: '0px', height: '100%' })
  })

  it('anchors to the top edge (full width)', () => {
    renderDrawer({ anchor: 'top' })
    expect(getPanel()).toHaveStyle({ top: '0px', width: '100%' })
  })

  it('anchors to the bottom edge (full width)', () => {
    renderDrawer({ anchor: 'bottom' })
    expect(getPanel()).toHaveStyle({ bottom: '0px', width: '100%' })
  })

  it('forwards the default elevation (16) to the Paper panel', () => {
    renderDrawer()
    expect(getPanel()).toHaveStyle({ boxShadow: baseTheme.shadows[16] })
  })

  it('forwards a custom elevation', () => {
    renderDrawer({ elevation: 4 })
    expect(getPanel()).toHaveStyle({ boxShadow: baseTheme.shadows[4] })
  })

  it('closes on Escape via the underlying Modal', () => {
    const onClose = vi.fn()
    renderDrawer({ onClose })
    fireEvent.keyDown(getRoot(), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClose.mock.calls[0][1]).toBe('escapeKey')
  })

  it('locks body scroll while open', () => {
    renderDrawer()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('supports every anchor without error', () => {
    const anchors: DrawerAnchor[] = ['left', 'right', 'top', 'bottom']
    anchors.forEach((anchor) => {
      const { unmount } = renderDrawer({ anchor })
      expect(getPanel()).toHaveStyle({ position: 'fixed' })
      unmount()
    })
  })
})
