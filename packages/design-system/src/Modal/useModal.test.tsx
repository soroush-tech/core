import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRef, type Ref } from 'react'
import { render, screen, fireEvent, createEvent, cleanup } from '@testing-library/react'
import { useModal, type UseModalParameters, type ModalCloseReason } from './useModal'

interface TestModalProps extends Omit<UseModalParameters, 'rootRef'> {
  name?: string
  rootRef?: Ref<Element>
  onRootKeyDown?: () => void
  onRootClick?: () => void
}

function TestModal({ name = 'a', onRootKeyDown, onRootClick, ...params }: TestModalProps) {
  const { getRootProps, getBackdropProps, portalRef } = useModal(params)
  return (
    <div ref={portalRef} data-testid={`portal-${name}`}>
      <div
        {...getRootProps({ onKeyDown: onRootKeyDown, onClick: onRootClick })}
        data-testid={`root-${name}`}
      >
        <div {...getBackdropProps()} data-testid={`backdrop-${name}`}>
          <button data-testid={`inner-${name}`}>x</button>
        </div>
      </div>
    </div>
  )
}

let host: HTMLElement

const mountHost = () => {
  host = document.createElement('div')
  document.body.append(host)
  return host
}

afterEach(() => {
  cleanup()
  host?.remove()
  document.body.removeAttribute('style')
})

describe('useModal — scroll lock', () => {
  it('locks the container on open and restores it on unmount', () => {
    const { unmount } = render(<TestModal isOpen container={mountHost()} />)
    expect(host.style.overflow).toBe('hidden')
    unmount()
    expect(host.style.overflow).toBe('')
  })

  it('does not lock when disableScrollLock is set', () => {
    render(<TestModal isOpen disableScrollLock container={mountHost()} />)
    expect(host.style.overflow).toBe('')
  })

  it('does not lock while closed', () => {
    render(<TestModal isOpen={false} container={mountHost()} />)
    expect(host.style.overflow).toBe('')
  })

  it('defaults the container to document.body', () => {
    const { unmount } = render(<TestModal isOpen />)
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('accepts a function that returns the container', () => {
    const target = mountHost()
    render(<TestModal isOpen container={() => target} />)
    expect(target.style.overflow).toBe('hidden')
  })

  it('re-registers on the new container when it changes while open', () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(first, second)
    const { rerender } = render(<TestModal isOpen container={first} />)
    expect(first.style.overflow).toBe('hidden')

    rerender(<TestModal isOpen container={second} />)
    // Lock moves to the new container; the old one is restored.
    expect(first.style.overflow).toBe('')
    expect(second.style.overflow).toBe('hidden')

    first.remove()
    second.remove()
  })

  it('releases the scroll lock when disableScrollLock flips on while open', () => {
    const target = mountHost()
    const { rerender } = render(<TestModal isOpen container={target} />)
    expect(target.style.overflow).toBe('hidden')

    rerender(<TestModal isOpen disableScrollLock container={target} />)
    expect(target.style.overflow).toBe('')
  })
})

describe('useModal — backdrop click', () => {
  it('calls onClose with reason "backdropClick" and forwards the handler on a root click', () => {
    const onClose = vi.fn()
    const onRootClick = vi.fn()
    render(<TestModal isOpen container={mountHost()} onClose={onClose} onRootClick={onRootClick} />)

    // The backdrop is pointer-events:none, so a scrim click resolves to the root.
    fireEvent.click(screen.getByTestId('root-a'))

    expect(onRootClick).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClose.mock.calls[0][1]).toBe<ModalCloseReason>('backdropClick')
  })

  it('ignores clicks that bubble up from a child element', () => {
    const onClose = vi.fn()
    render(<TestModal isOpen container={mountHost()} onClose={onClose} />)

    fireEvent.click(screen.getByTestId('inner-a'))

    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('useModal — escape key', () => {
  it('calls onClose with reason "escapeKey" and forwards the consumer handler', () => {
    const onClose = vi.fn()
    const onRootKeyDown = vi.fn()
    render(
      <TestModal isOpen container={mountHost()} onClose={onClose} onRootKeyDown={onRootKeyDown} />
    )

    fireEvent.keyDown(screen.getByTestId('root-a'), { key: 'Escape' })

    expect(onRootKeyDown).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClose.mock.calls[0][1]).toBe<ModalCloseReason>('escapeKey')
  })

  it('ignores non-Escape keys', () => {
    const onClose = vi.fn()
    render(<TestModal isOpen container={mountHost()} onClose={onClose} />)
    fireEvent.keyDown(screen.getByTestId('root-a'), { key: 'a' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('ignores Escape while an IME is composing (which === 229)', () => {
    const onClose = vi.fn()
    render(<TestModal isOpen container={mountHost()} onClose={onClose} />)

    const root = screen.getByTestId('root-a')
    const event = createEvent.keyDown(root, { key: 'Escape' })
    // React derives the synthetic event's `which` from the native keyCode.
    Object.defineProperty(event, 'keyCode', { get: () => 229 })
    fireEvent(root, event)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('only the top modal closes on Escape', () => {
    const onCloseLower = vi.fn()
    const onCloseUpper = vi.fn()
    mountHost()
    render(
      <>
        <TestModal name="lower" isOpen container={host} onClose={onCloseLower} />
        <TestModal name="upper" isOpen container={host} onClose={onCloseUpper} />
      </>
    )

    // The lower modal is not on top, so its Escape is ignored.
    fireEvent.keyDown(screen.getByTestId('root-lower'), { key: 'Escape' })
    expect(onCloseLower).not.toHaveBeenCalled()

    // The top (upper) modal does close on Escape.
    fireEvent.keyDown(screen.getByTestId('root-upper'), { key: 'Escape' })
    expect(onCloseUpper).toHaveBeenCalledTimes(1)
    expect(onCloseLower).not.toHaveBeenCalled()
  })

  it('does nothing when no onClose is provided', () => {
    render(<TestModal isOpen container={mountHost()} />)
    expect(() => {
      fireEvent.keyDown(screen.getByTestId('root-a'), { key: 'Escape' })
      fireEvent.click(screen.getByTestId('backdrop-a'))
    }).not.toThrow()
  })
})

describe('useModal — root ref', () => {
  it('forwards the root element to a provided ref', () => {
    const ref = createRef<Element>()
    render(<TestModal isOpen container={mountHost()} rootRef={ref} />)
    expect(ref.current).toBe(screen.getByTestId('root-a'))
  })
})
