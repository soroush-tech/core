import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as ReactDOM from 'react-dom/client'
import * as React from 'react'
import * as Config from 'src/config'

// Mock dependencies
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}))

vi.mock('./Providers.tsx', () => ({
  Providers: vi.fn(({ children }) => <div data-testid="providers">{children}</div>),
}))

vi.mock('./App.tsx', () => ({
  default: vi.fn(() => <div data-testid="app">App Component</div>),
}))

vi.mock('src/config.ts', () => ({
  MSW_ACTIVE: false,
}))

vi.mock('src/test/mocks/browser', () => ({
  worker: {
    start: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock the DOM element
const mockRootElement = document.createElement('div')
mockRootElement.id = 'root'

describe('main.tsx', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    document.body.innerHTML = ''
    document.body.appendChild(mockRootElement)
  })

  afterEach(() => {
    vi.resetModules()
  })

  // Importing main.tsx renders the whole app tree, which can exceed the 5s default when the
  // full monorepo suite runs cold under load — give it generous headroom to avoid flaky timeouts.
  it('renders the app inside Providers and StrictMode', { timeout: 20_000 }, async () => {
    // Import the module to trigger the rendering
    await import('./main.tsx')

    // Verify createRoot was called with the root element
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(mockRootElement)

    // Verify render was called
    const mockRoot = vi.mocked(ReactDOM.createRoot).mock.results[0].value
    expect(mockRoot.render).toHaveBeenCalledTimes(1)

    // Verify the render structure (StrictMode > Providers > App)
    const renderCall = mockRoot.render.mock.calls[0][0]
    expect(renderCall.type).toBe(React.StrictMode)
  })

  it('does not start MSW worker when MSW_ACTIVE is false', async () => {
    // Ensure MSW_ACTIVE is false
    vi.spyOn(Config, 'MSW_ACTIVE', 'get').mockReturnValue(false)

    // Reset modules to ensure clean import
    vi.resetModules()

    // Import the module to trigger the code
    await import('./main.tsx')

    // Import the worker module to verify it wasn't started
    const { worker } = await import('src/test/mocks/browser')
    expect(worker.start).not.toHaveBeenCalled()
  })

  it('starts MSW worker when MSW_ACTIVE is true', async () => {
    // Mock MSW_ACTIVE as true
    vi.spyOn(Config, 'MSW_ACTIVE', 'get').mockReturnValue(true)

    // Reset modules to ensure clean import
    vi.resetModules()

    // Import the module to trigger the code
    await import('./main.tsx')

    // Import the worker module to verify it was started
    const { worker } = await import('src/test/mocks/browser')
    expect(worker.start).toHaveBeenCalledTimes(1)
  })
})
