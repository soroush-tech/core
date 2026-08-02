import { renderHook, waitFor } from '@testing-library/react'
import { useGistFiles } from './useGistFiles'

const gistsApi = {
  list: vi.fn(),
  files: vi.fn(),
  draft: vi.fn(),
  stage: vi.fn(),
  reset: vi.fn(),
  publish: vi.fn(),
}

vi.stubGlobal('editorAPI', { gists: gistsApi })

const FILES = [{ filename: 'notes.md', content: '# notes' }]

beforeEach(() => {
  vi.clearAllMocks()
  gistsApi.files.mockResolvedValue({ success: true, data: FILES })
})

describe('useGistFiles', () => {
  it('stays idle until a gist is selected', () => {
    const { result } = renderHook(() => useGistFiles(null))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.files).toEqual([])
    expect(gistsApi.files).not.toHaveBeenCalled()
  })

  it('loads the files of the selected gist', async () => {
    const { result } = renderHook(() => useGistFiles('abc123'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(gistsApi.files).toHaveBeenCalledWith('abc123')
    expect(result.current.files).toEqual(FILES)
  })

  it('refetches when the selected gist changes', async () => {
    const { rerender, result } = renderHook(({ id }) => useGistFiles(id), {
      initialProps: { id: 'abc123' },
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender({ id: 'def456' })
    await waitFor(() => expect(gistsApi.files).toHaveBeenLastCalledWith('def456'))
  })

  it('ignores a slower response for a gist that is no longer selected', async () => {
    const slow = [{ filename: 'stale.md', content: 'stale' }]
    let resolveSlow: ((value: unknown) => void) | undefined
    gistsApi.files.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSlow = resolve
      })
    )

    const { rerender, result } = renderHook(({ id }) => useGistFiles(id), {
      initialProps: { id: 'abc123' },
    })
    rerender({ id: 'def456' })
    await waitFor(() => expect(result.current.files).toEqual(FILES))

    resolveSlow!({ success: true, data: slow })
    await waitFor(() => expect(result.current.files).toEqual(FILES))
  })

  it('reports a failure', async () => {
    gistsApi.files.mockResolvedValue({ success: false, error: 'GitHub responded 404' })
    const { result } = renderHook(() => useGistFiles('abc123'))

    await waitFor(() => expect(result.current.error).toBe('GitHub responded 404'))
    expect(result.current.files).toEqual([])
  })
})
