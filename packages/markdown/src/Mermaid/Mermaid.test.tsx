import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render as renderRTL, screen, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme, baseTheme } from '@soroush.tech/design-system/theme'
import mermaid from 'mermaid'
import { syntaxDark } from '../CodeBlock/CodeBlock.data'
import { Mermaid } from './Mermaid'

vi.mock('mermaid', () => ({
  default: { initialize: vi.fn(), render: vi.fn() },
}))

const render = vi.mocked(mermaid.render)
const initialize = vi.mocked(mermaid.initialize)

beforeEach(() => {
  vi.clearAllMocks()
})

const flush = () => new Promise((resolve) => setTimeout(resolve))

// `Mermaid` always renders a `CodeBlock` fallback until its diagram resolves, so every
// theme rendering it here — success or failure — needs `theme.syntax`.
const theme = createTheme(baseTheme, { syntax: syntaxDark })
const renderWithTheme = (ui: ReactNode) =>
  renderRTL(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)

describe('Mermaid', () => {
  it('renders the diagram SVG once mermaid resolves', async () => {
    render.mockResolvedValue({ svg: '<svg data-testid="diagram"></svg>' } as never)

    renderWithTheme(<Mermaid chart="graph TD; A-->B" />)

    await waitFor(() => expect(screen.getByTestId('diagram')).toBeInTheDocument())
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ startOnLoad: false, securityLevel: 'strict', theme: 'dark' })
    )
    expect(render).toHaveBeenCalledWith(expect.stringMatching(/^mermaid-/), 'graph TD; A-->B')
  })

  it('uses light-mode derivations and merges theme.mermaid overrides for a light theme', async () => {
    render.mockResolvedValue({ svg: '<svg data-testid="override"></svg>' } as never)
    const lightTheme = createTheme(baseTheme, {
      colorScheme: 'light',
      mermaid: { primaryColor: '#BB2528' },
      syntax: syntaxDark,
    })

    renderRTL(
      <ThemeProvider theme={lightTheme}>
        <Mermaid chart="graph TD; A-->B" />
      </ThemeProvider>
    )

    await waitFor(() => expect(screen.getByTestId('override')).toBeInTheDocument())
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'default',
        themeVariables: expect.objectContaining({ darkMode: false, primaryColor: '#BB2528' }),
      })
    )
  })

  it('falls back to the source when rendering fails', async () => {
    render.mockRejectedValue(new Error('invalid syntax'))

    const { container } = renderWithTheme(<Mermaid chart="not a diagram" />)

    await waitFor(() => expect(render).toHaveBeenCalled())
    await flush()
    // No rendered diagram — the source stays visible in the CodeBlock fallback.
    expect(screen.queryByTestId('diagram')).toBeNull()
    expect(container.textContent).toContain('not a diagram')
  })

  it('ignores a resolved diagram after unmount', async () => {
    let resolve!: (value: { svg: string }) => void
    render.mockReturnValue(new Promise((r) => (resolve = r)) as never)

    const { unmount } = renderWithTheme(<Mermaid chart="graph TD; A-->B" />)
    await waitFor(() => expect(render).toHaveBeenCalled())

    unmount()
    resolve({ svg: '<svg data-testid="late"></svg>' })
    await flush()

    expect(screen.queryByTestId('late')).toBeNull()
  })

  it('ignores a failed render after unmount', async () => {
    let reject!: (error: Error) => void
    render.mockReturnValue(new Promise((_, r) => (reject = r)) as never)

    const { unmount } = renderWithTheme(<Mermaid chart="graph TD; A-->B" />)
    await waitFor(() => expect(render).toHaveBeenCalled())

    unmount()
    reject(new Error('too late'))
    await flush()

    expect(document.querySelector('svg')).toBeNull()
  })
})
