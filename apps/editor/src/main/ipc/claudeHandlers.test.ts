import { CLAUDE_CHANNELS } from '../../shared/ipc'

const { handlers } = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => unknown>(),
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(channel, handler)
    },
  },
}))

const { registerClaudeHandlers } = await import('./claudeHandlers')

const runEdit = vi.fn()
registerClaudeHandlers(runEdit)
const invoke = (...args: unknown[]) => handlers.get(CLAUDE_CHANNELS.editSelection)!({}, ...args)

beforeEach(() => vi.clearAllMocks())

describe('registerClaudeHandlers', () => {
  it.each([
    ['non-string selection', 42, 'fix it'],
    ['empty selection', '', 'fix it'],
    ['non-string instruction', 'text', 42],
    ['blank instruction', 'text', '   '],
  ])('rejects %s without invoking the CLI', async (_name, selectedText, instruction) => {
    await expect(invoke(selectedText, instruction)).resolves.toEqual({
      success: false,
      error: 'Invalid edit request',
    })
    expect(runEdit).not.toHaveBeenCalled()
  })

  it('delegates a valid request to the CLI bridge', async () => {
    runEdit.mockResolvedValue({ success: true, data: 'rewritten' })
    await expect(invoke('old', 'improve')).resolves.toEqual({ success: true, data: 'rewritten' })
    expect(runEdit).toHaveBeenCalledWith({ selectedText: 'old', instruction: 'improve' })
  })
})
