import { renderHook, waitFor } from '@testing-library/react'
import { useGists } from './useGists'

const gistsApi = { list: vi.fn() }

vi.stubGlobal('editorAPI', { gists: gistsApi })

const GISTS = [
  { id: 'abc123', description: 'A snippet', filename: 'notes.md', fileCount: 1, isPublic: false },
]

beforeEach(() => {
  vi.clearAllMocks()
  gistsApi.list.mockResolvedValue({ success: true, data: GISTS })
})

describe('useGists', () => {
  it('loads the gists on mount', async () => {
    const { result } = renderHook(() => useGists())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.gists).toEqual(GISTS)
    expect(result.current.error).toBeNull()
  })

  it('reports a failure and settles', async () => {
    gistsApi.list.mockResolvedValue({ success: false, error: 'Connect a GitHub account' })
    const { result } = renderHook(() => useGists())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Connect a GitHub account')
    expect(result.current.gists).toEqual([])
  })

  it('fetches once per mount', async () => {
    const { rerender, result } = renderHook(() => useGists())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender()
    expect(gistsApi.list).toHaveBeenCalledTimes(1)
  })
})
