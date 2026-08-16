import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
  hydrateRoot: vi.fn(),
}))
vi.mock('src/utils', () => ({ initMSW: vi.fn() }))
vi.mock('src/common/Bootstrap', () => ({ Bootstrap: () => null }))

import { onRenderClient } from './+onRenderClient'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { initMSW } from 'src/utils'

// Tests run in declaration order - the module-level `root` variable in
// +onRenderClient progresses naturally: undefined → (hydrateRoot result) → createRoot result.
// hydrateRoot is mocked as vi.fn() which returns undefined by default, so root
// stays falsy after the hydration test, allowing the non-hydration test to
// exercise createRoot on the first CSR call.
describe('+onRenderClient', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    vi.clearAllMocks()
    container = document.createElement('div')
    container.id = 'root'
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    document.head.querySelectorAll('[data-mh]').forEach((el) => el.remove())
  })

  it('hydration: calls hydrateRoot and initMSW on first call', async () => {
    await onRenderClient({ isHydration: true } as never)
    expect(initMSW).toHaveBeenCalledOnce()
    expect(hydrateRoot).toHaveBeenCalledWith(container, expect.anything())
  })

  it('non-hydration: calls createRoot and initMSW on first CSR call', async () => {
    await onRenderClient({ isHydration: false } as never)
    expect(initMSW).toHaveBeenCalledOnce()
    expect(createRoot).toHaveBeenCalledWith(container)
  })

  it('non-hydration: syncs the head tags from the page config', async () => {
    await onRenderClient({
      isHydration: false,
      config: { title: 'About', description: 'Who I am.' },
      urlPathname: '/about',
    } as never)
    expect(document.title).toBe('About · SOROUSH.TECH')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Who I am.'
    )
  })

  it('non-hydration: skips createRoot and initMSW on subsequent CSR calls', async () => {
    await onRenderClient({ isHydration: false } as never)
    expect(createRoot).not.toHaveBeenCalled()
    expect(initMSW).not.toHaveBeenCalled()
  })
})
