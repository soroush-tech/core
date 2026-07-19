import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { PageContext as VikePageContext } from 'vike/types'

vi.mock('src/common/Routes', () => ({
  Routes: vi.fn(() => <div data-testid="routes" />),
}))
vi.mock('src/common/Providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('@soroush.tech/design-system/engine', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@soroush.tech/design-system/engine')>()),
  styleCache: { key: 'soroush', inserted: {}, registered: {}, sheet: { tags: [] } },
}))

import { Bootstrap } from './Bootstrap'
import { Routes } from 'src/common/Routes'

describe('Bootstrap', () => {
  it('renders without crashing', () => {
    const ctx = {} as VikePageContext
    const { container } = render(<Bootstrap pageContext={ctx} />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders Routes', () => {
    const ctx = {} as VikePageContext
    render(<Bootstrap pageContext={ctx} />)
    expect(screen.getByTestId('routes')).toBeInTheDocument()
  })

  it('passes pageContext to Routes', () => {
    const ctx = { urlPathname: '/test' } as unknown as VikePageContext
    render(<Bootstrap pageContext={ctx} />)
    expect(vi.mocked(Routes)).toHaveBeenCalledWith(
      expect.objectContaining({ pageContext: ctx }),
      undefined
    )
  })
})
