import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, cleanup } from '@testing-library/react'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { dark } from '../themes'
import { Modal } from './'

const getRoot = () => document.querySelector('[role="presentation"]') as HTMLElement
const getBackdrop = () => getRoot()?.querySelector('[aria-hidden="true"]')

afterEach(() => {
  cleanup()
  document.body.removeAttribute('style')
})

describe('Modal', () => {
  it('renders nothing when closed and not kept mounted', () => {
    renderWithTheme(
      <Modal isOpen={false}>
        <div data-testid="content">x</div>
      </Modal>
    )
    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('portals its content into the document body when open', () => {
    renderWithTheme(
      <Modal isOpen>
        <div data-testid="content">x</div>
      </Modal>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(getRoot()).not.toBeNull()
  })

  it('keeps content mounted while closed when shouldKeepMounted is set', () => {
    renderWithTheme(
      <Modal isOpen={false} shouldKeepMounted>
        <div data-testid="content">x</div>
      </Modal>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('renders a backdrop by default and omits it when hasBackdrop is false', () => {
    const { unmount } = renderWithTheme(
      <Modal isOpen>
        <div>x</div>
      </Modal>
    )
    expect(getBackdrop()).not.toBeNull()
    unmount()

    renderWithTheme(
      <Modal isOpen hasBackdrop={false}>
        <div>x</div>
      </Modal>
    )
    expect(getBackdrop()).toBeNull()
  })

  it('closes when the dimmed area (root) is clicked', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Modal isOpen onClose={onClose}>
        <div>x</div>
      </Modal>
    )
    // The backdrop is pointer-events:none, so the scrim click lands on the root.
    fireEvent.click(getRoot())
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClose.mock.calls[0][1]).toBe('backdropClick')
  })

  it('does not close when the content is clicked', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Modal isOpen onClose={onClose}>
        <div data-testid="content">x</div>
      </Modal>
    )
    fireEvent.click(screen.getByTestId('content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Modal isOpen onClose={onClose}>
        <div>x</div>
      </Modal>
    )
    fireEvent.keyDown(getRoot(), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClose.mock.calls[0][1]).toBe('escapeKey')
  })

  it('locks body scroll while open', () => {
    renderWithTheme(
      <Modal isOpen>
        <div>x</div>
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('layers the root at theme.zOrder.modal', () => {
    renderWithTheme(
      <Modal isOpen>
        <div>x</div>
      </Modal>
    )
    expect(getRoot()).toHaveStyle({ zIndex: dark.zOrder.modal })
  })

  it('layers the root at a custom theme.zOrder layer', () => {
    renderWithTheme(
      <Modal isOpen layer="drawer">
        <div>x</div>
      </Modal>
    )
    expect(getRoot()).toHaveStyle({ zIndex: dark.zOrder.drawer })
  })

  it('does not throw when a stacked modal unmounts while another stays open', () => {
    const { rerender } = renderWithTheme(
      <>
        <Modal isOpen>
          <div data-testid="lower">lower</div>
        </Modal>
        <Modal isOpen>
          <div data-testid="upper">upper</div>
        </Modal>
      </>
    )
    // Closing the top modal unmounts it while the lower one is still registered —
    // the stacked-removal path must not dereference a null portal mount node.
    expect(() =>
      rerender(
        <>
          <Modal isOpen>
            <div data-testid="lower">lower</div>
          </Modal>
          <Modal isOpen={false}>
            <div data-testid="upper">upper</div>
          </Modal>
        </>
      )
    ).not.toThrow()
    expect(screen.getByTestId('lower')).toBeInTheDocument()
    expect(screen.queryByTestId('upper')).toBeNull()
  })

  it('centres its content in the viewport', () => {
    renderWithTheme(
      <Modal isOpen>
        <div>x</div>
      </Modal>
    )
    expect(getRoot()).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    })
  })

  it('centres content within the viewport by default (scroll="paper")', () => {
    renderWithTheme(
      <Modal isOpen>
        <div>x</div>
      </Modal>
    )
    expect(getRoot()).toHaveStyle({ alignItems: 'center', justifyContent: 'center' })
  })

  it('makes the root the scroll container when scroll="body"', () => {
    renderWithTheme(
      <Modal isOpen scroll="body">
        <div>x</div>
      </Modal>
    )
    expect(getRoot()).toHaveStyle({ flexDirection: 'column', overflowY: 'auto' })
  })

  it('renders inline without a portal when shouldUsePortal is false', () => {
    const { container } = renderWithTheme(
      <Modal isOpen shouldUsePortal={false}>
        <div data-testid="content">x</div>
      </Modal>
    )
    expect(container.contains(screen.getByTestId('content'))).toBe(true)
  })

  it('moves focus into the content on open', () => {
    renderWithTheme(
      <Modal isOpen>
        <button data-testid="cta">go</button>
      </Modal>
    )
    expect(screen.getByTestId('cta')).toHaveFocus()
  })

  it('pulls focus back into the content when it escapes', () => {
    renderWithTheme(
      <Modal isOpen>
        <button data-testid="cta">go</button>
      </Modal>
    )
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    expect(screen.getByTestId('cta')).toHaveFocus()
    outside.remove()
  })
})
