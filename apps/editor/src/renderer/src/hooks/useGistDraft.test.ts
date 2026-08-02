import { act, renderHook, waitFor } from '@testing-library/react'
import { countChanges, useGistDraft } from './useGistDraft'

let announce: ((change: { gistId: string; draft: unknown }) => void) | undefined
const unsubscribe = vi.fn()

const gistsApi = {
  draft: vi.fn(),
  stage: vi.fn(),
  stageDescription: vi.fn(),
  reset: vi.fn(),
  publish: vi.fn(),
  onDraftChanged: vi.fn((callback: (change: { gistId: string; draft: unknown }) => void) => {
    announce = callback
    return unsubscribe
  }),
}

vi.stubGlobal('editorAPI', { gists: gistsApi })

const DRAFT = { files: { 'notes.md': { status: 'modified' as const, content: 'edited' } } }

beforeEach(() => {
  vi.clearAllMocks()
  gistsApi.draft.mockResolvedValue({ success: true, data: DRAFT })
  gistsApi.stage.mockResolvedValue({ success: true, data: DRAFT })
  gistsApi.stageDescription.mockResolvedValue({ success: true, data: DRAFT })
  gistsApi.reset.mockResolvedValue({ success: true, data: true })
  gistsApi.publish.mockResolvedValue({ success: true, data: null })
})

describe('useGistDraft', () => {
  it('holds nothing until a gist is selected', () => {
    const { result } = renderHook(() => useGistDraft(null))

    expect(result.current.draft).toEqual({ files: {} })
    expect(gistsApi.draft).not.toHaveBeenCalled()
  })

  it('loads what is already staged for the gist', async () => {
    const { result } = renderHook(() => useGistDraft('abc123'))

    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))
    expect(gistsApi.draft).toHaveBeenCalledWith('abc123')
  })

  it('empties when the draft cannot be read', async () => {
    gistsApi.draft.mockResolvedValue({ success: false, error: 'EACCES' })
    const { result } = renderHook(() => useGistDraft('abc123'))

    await waitFor(() => expect(gistsApi.draft).toHaveBeenCalled())
    expect(result.current.draft).toEqual({ files: {} })
  })

  it('ignores a slower response for a gist that is no longer selected', async () => {
    let resolveSlow: ((value: unknown) => void) | undefined
    gistsApi.draft.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSlow = resolve
      })
    )

    const { rerender, result } = renderHook(({ id }) => useGistDraft(id), {
      initialProps: { id: 'abc123' },
    })
    rerender({ id: 'def456' })
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    resolveSlow!({
      success: true,
      data: { files: { 'stale.md': { status: 'added', content: '' } } },
    })
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))
  })

  it('adopts the draft main returns after staging', async () => {
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    const staged = { files: { 'notes.md': { status: 'deleted' as const } } }
    gistsApi.stage.mockResolvedValue({ success: true, data: staged })

    let accepted: boolean | undefined
    await act(async () => {
      accepted = await result.current.stage('abc123', 'notes.md', { status: 'deleted' })
    })

    expect(accepted).toBe(true)
    expect(result.current.draft).toEqual(staged)
  })

  it('reports a staging failure and keeps the draft', async () => {
    gistsApi.stage.mockResolvedValue({ success: false, error: 'EACCES' })
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    await act(async () => {
      await result.current.stage('abc123', 'notes.md', { status: 'deleted' })
    })

    expect(result.current.error).toBe('EACCES')
    expect(result.current.draft).toEqual(DRAFT)
  })

  it('adopts the draft after staging a description', async () => {
    const withDescription = { files: {}, description: 'A better one' }
    gistsApi.stageDescription.mockResolvedValue({ success: true, data: withDescription })
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    let accepted: boolean | undefined
    await act(async () => {
      accepted = await result.current.stageDescription('abc123', 'A better one')
    })

    expect(accepted).toBe(true)
    expect(result.current.draft).toEqual(withDescription)
  })

  it('reports a failure to stage a description', async () => {
    gistsApi.stageDescription.mockResolvedValue({ success: false, error: 'EACCES' })
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    await act(async () => {
      await result.current.stageDescription('abc123', 'A better one')
    })

    expect(result.current.error).toBe('EACCES')
    expect(result.current.draft).toEqual(DRAFT)
  })

  it('empties the draft on reset', async () => {
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    await act(async () => result.current.reset('abc123'))
    expect(result.current.draft).toEqual({ files: {} })
  })

  it('keeps the draft when the reset is cancelled', async () => {
    gistsApi.reset.mockResolvedValue({ success: true, data: false })
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    await act(async () => result.current.reset('abc123'))
    expect(result.current.draft).toEqual(DRAFT)
  })

  it('reports a failed reset', async () => {
    gistsApi.reset.mockResolvedValue({ success: false, error: 'EACCES' })
    const { result } = renderHook(() => useGistDraft('abc123'))

    await act(async () => result.current.reset('abc123'))
    expect(result.current.error).toBe('EACCES')
  })

  it('empties the draft once published', async () => {
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    await act(async () => result.current.publish('abc123'))
    expect(result.current.draft).toEqual({ files: {} })
  })

  it('picks up a draft staged elsewhere — a save in the editor', async () => {
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    const staged = {
      files: { 'notes.md': { status: 'modified' as const, content: 'saved from the editor' } },
    }
    act(() => announce!({ gistId: 'abc123', draft: staged }))

    expect(result.current.draft).toEqual(staged)
  })

  it('ignores a change announced for a different gist', async () => {
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    act(() =>
      announce!({ gistId: 'def456', draft: { files: { 'other.md': { status: 'deleted' } } } })
    )

    expect(result.current.draft).toEqual({ files: {} })
  })

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useGistDraft('abc123'))
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('keeps the draft when publishing fails', async () => {
    gistsApi.publish.mockResolvedValue({ success: false, error: 'GitHub responded 422' })
    const { result } = renderHook(() => useGistDraft('abc123'))
    await waitFor(() => expect(result.current.draft).toEqual(DRAFT))

    await act(async () => result.current.publish('abc123'))

    expect(result.current.error).toBe('GitHub responded 422')
    expect(result.current.draft).toEqual(DRAFT)
  })
})

describe('countChanges', () => {
  it.each([
    ['nothing staged', { files: {} }, 0],
    ['one file', { files: { 'a.md': { status: 'deleted' as const } } }, 1],
    ['only a description', { files: {}, description: 'new' }, 1],
    [
      'files and a description',
      { files: { 'a.md': { status: 'deleted' as const } }, description: 'new' },
      2,
    ],
  ])('counts %s', (_name, draft, expected) => {
    expect(countChanges(draft)).toBe(expected)
  })
})
