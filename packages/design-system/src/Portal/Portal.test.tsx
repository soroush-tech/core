import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Portal } from './'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Portal', () => {
  it('renders its children into document.body by default', () => {
    render(
      <Portal>
        <div data-testid="content">hi</div>
      </Portal>
    )
    expect(screen.getByTestId('content').parentElement).toBe(document.body)
  })

  it('renders its children into a provided container element', () => {
    const container = document.createElement('div')
    document.body.append(container)
    render(
      <Portal container={container}>
        <div data-testid="content">hi</div>
      </Portal>
    )
    expect(container.contains(screen.getByTestId('content'))).toBe(true)
    container.remove()
  })

  it('renders its children into a container returned by a function', () => {
    const container = document.createElement('div')
    document.body.append(container)
    render(
      <Portal container={() => container}>
        <div data-testid="content">hi</div>
      </Portal>
    )
    expect(container.contains(screen.getByTestId('content'))).toBe(true)
    container.remove()
  })

  it('renders nothing when there is no document (server rendering)', () => {
    vi.stubGlobal('document', undefined)
    expect(
      renderToStaticMarkup(
        <Portal>
          <div>hi</div>
        </Portal>
      )
    ).toBe('')
  })
})
