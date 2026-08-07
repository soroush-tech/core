import { act, renderHook } from '@testing-library/react'
import type { ClaudeEvent } from '../../../shared/ipc'
import { useClaudeEdit } from './useClaudeEdit'

const unsubscribe = vi.fn()
let listener: ((event: ClaudeEvent) => void) | undefined

const claudeApi = {
  startEdit: vi.fn(),
  cancel: vi.fn(),
  onEvent: vi.fn((callback: (event: ClaudeEvent) => void) => {
    listener = callback
    return unsubscribe
  }),
}

vi.stubGlobal('editorAPI', { claude: claudeApi })

/** Delivers an event the way main would. */
const emit = (event: ClaudeEvent) => act(() => listener!(event))

beforeEach(() => {
  vi.clearAllMocks()
  claudeApi.startEdit.mockResolvedValue({ success: true, data: 'run-1' })
  claudeApi.cancel.mockResolvedValue({ success: true, data: null })
})

const onText = vi.fn()

/** Starts a run and hands back the promise the caller is waiting on. */
async function startRun() {
  const hook = renderHook(() => useClaudeEdit({ onText }))
  let pending!: Promise<string | null>
  await act(async () => {
    pending = hook.result.current.editSelection('old', 'improve')
  })
  return { ...hook, pending }
}

describe('useClaudeEdit', () => {
  it('reports the text as it is written, and resolves with the run’s own result', async () => {
    const { result, pending } = await startRun()
    expect(result.current.isLoading).toBe(true)
    expect(claudeApi.startEdit).toHaveBeenCalledWith('old', 'improve', null)

    await emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'Hel' })
    await emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'lo' })

    // Everything so far each time, so the caller can replace rather than append.
    expect(onText.mock.calls).toEqual([['Hel'], ['Hello']])

    await emit({ type: 'RUN_FINISHED', runId: 'run-1', text: 'Hello there' })

    await expect(pending).resolves.toBe('Hello there')
    expect(result.current.isLoading).toBe(false)
  })

  it('reports a failed run as an error and resolves null', async () => {
    const { result, pending } = await startRun()

    await emit({ type: 'RUN_ERROR', runId: 'run-1', error: 'not signed in' })

    await expect(pending).resolves.toBeNull()
    expect(result.current).toMatchObject({ error: 'not signed in', isLoading: false })
  })

  it('starts the next run clean, without the last one’s error or text', async () => {
    const { result } = await startRun()
    await emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'half' })
    await emit({ type: 'RUN_ERROR', runId: 'run-1', error: 'not signed in' })

    claudeApi.startEdit.mockResolvedValue({ success: true, data: 'run-2' })
    await act(async () => {
      void result.current.editSelection('old', 'again')
    })
    onText.mockClear()
    await emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-2', delta: 'fresh' })

    expect(result.current.error).toBeNull()
    // Not "halffresh": the previous run's text is gone.
    expect(onText).toHaveBeenCalledWith('fresh')
  })

  it('reports a run that could not be started at all', async () => {
    claudeApi.startEdit.mockResolvedValue({ success: false, error: 'Invalid edit request' })
    const { result, pending } = await startRun()

    await expect(pending).resolves.toBeNull()
    expect(result.current).toMatchObject({ error: 'Invalid edit request', isLoading: false })
  })

  it('has nothing to report for a run that has only just started', async () => {
    const { result } = await startRun()

    await emit({ type: 'RUN_STARTED', runId: 'run-1' })

    expect(onText).not.toHaveBeenCalled()
    expect(result.current).toMatchObject({ error: null, isLoading: true })
  })

  it('ignores events belonging to another run', async () => {
    const { result } = await startRun()

    await emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-2', delta: 'not mine' })

    expect(onText).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(true)
  })

  it('stops a run, applying nothing and reporting nothing', async () => {
    const { result, pending } = await startRun()

    await act(() => result.current.cancel())

    expect(claudeApi.cancel).toHaveBeenCalledWith('run-1')
    await expect(pending).resolves.toBeNull()
    expect(result.current).toMatchObject({ isLoading: false, error: null })
  })

  it('has nothing to cancel when no run is in flight', async () => {
    const { result } = renderHook(() => useClaudeEdit({ onText }))

    await act(() => result.current.cancel())

    expect(claudeApi.cancel).not.toHaveBeenCalled()
  })

  it('stops listening once the panel is gone', () => {
    const { unmount } = renderHook(() => useClaudeEdit({ onText }))
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
