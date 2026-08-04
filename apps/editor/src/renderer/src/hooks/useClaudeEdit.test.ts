import { act, renderHook } from '@testing-library/react'
import { useClaudeEdit } from './useClaudeEdit'

const claudeApi = { editSelection: vi.fn() }

vi.stubGlobal('editorAPI', { claude: claudeApi })

beforeEach(() => vi.clearAllMocks())

describe('useClaudeEdit', () => {
  it('resolves the rewritten text and toggles loading around the call', async () => {
    let release!: (value: unknown) => void
    claudeApi.editSelection.mockReturnValue(new Promise((resolve) => (release = resolve)))
    const { result } = renderHook(() => useClaudeEdit())

    let pending!: Promise<string | null>
    act(() => {
      pending = result.current.editSelection('old', 'improve')
    })
    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      release({ success: true, data: 'new' })
      await expect(pending).resolves.toBe('new')
    })
    expect(result.current.isLoading).toBe(false)
    expect(claudeApi.editSelection).toHaveBeenCalledWith('old', 'improve')
  })

  it('captures failures as error and resolves null', async () => {
    claudeApi.editSelection.mockResolvedValue({ success: false, error: 'not signed in' })
    const { result } = renderHook(() => useClaudeEdit())

    await act(async () => {
      await expect(result.current.editSelection('old', 'improve')).resolves.toBeNull()
    })
    expect(result.current.error).toBe('not signed in')

    // The next attempt clears the previous error.
    claudeApi.editSelection.mockResolvedValue({ success: true, data: 'new' })
    await act(async () => {
      await result.current.editSelection('old', 'improve')
    })
    expect(result.current.error).toBeNull()
  })
})
