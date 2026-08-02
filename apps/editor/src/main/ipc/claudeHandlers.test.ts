import { CLAUDE_CHANNELS, type ClaudeEvent } from '../../shared/ipc'

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

const runner = { start: vi.fn(), cancel: vi.fn() }
/** The runner's own channel back to the renderer, captured at registration. */
let emit!: (event: ClaudeEvent) => void

let nextRunId = 'run-1'
registerClaudeHandlers(
  (emitter) => {
    emit = emitter
    return runner
  },
  () => nextRunId
)

/** Stands in for a window: only its `send` matters here. */
const createSender = () => ({ send: vi.fn() })
const window = createSender()

const start = (...args: unknown[]) =>
  handlers.get(CLAUDE_CHANNELS.startEdit)!({ sender: window }, ...args)
const cancel = (runId: unknown, sender: unknown = window) =>
  handlers.get(CLAUDE_CHANNELS.cancel)!({ sender }, runId)

beforeEach(() => {
  vi.clearAllMocks()
  nextRunId = 'run-1'
})

describe('registerClaudeHandlers', () => {
  it.each([
    ['non-string selection', 42, 'fix it'],
    ['non-string instruction', 'text', 42],
    ['blank instruction', 'text', '   '],
  ])('rejects %s without starting a run', async (_name, selectedText, instruction) => {
    expect(start(selectedText, instruction)).toEqual({
      success: false,
      error: 'Invalid edit request',
    })
    expect(runner.start).not.toHaveBeenCalled()
  })

  it('starts a run and answers with its id', async () => {
    expect(start('old', 'improve')).toEqual({ success: true, data: 'run-1' })
    expect(runner.start).toHaveBeenCalledWith('run-1', {
      selectedText: 'old',
      instruction: 'improve',
    })
  })

  it('passes a referenced gist through as context', () => {
    expect(start('', 'a second part', '# Rehydration')).toEqual({ success: true, data: 'run-1' })
    expect(runner.start).toHaveBeenCalledWith('run-1', {
      selectedText: '',
      instruction: 'a second part',
      context: '# Rehydration',
    })
  })

  it('rejects a context that is not text', () => {
    expect(start('old', 'improve', 42)).toEqual({
      success: false,
      error: 'Invalid edit request',
    })
    expect(runner.start).not.toHaveBeenCalled()
  })

  it('accepts an empty selection — writing new content into an empty document', async () => {
    expect(start('', 'write an article')).toEqual({ success: true, data: 'run-1' })
    expect(runner.start).toHaveBeenCalledWith('run-1', {
      selectedText: '',
      instruction: 'write an article',
    })
  })

  it('sends a run’s events to the window that started it', async () => {
    await start('old', 'improve')

    emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'Hel' })

    expect(window.send).toHaveBeenCalledWith(CLAUDE_CHANNELS.event, {
      type: 'TEXT_MESSAGE_CONTENT',
      runId: 'run-1',
      delta: 'Hel',
    })
  })

  it('has nobody to tell about a run it does not know', () => {
    emit({ type: 'RUN_FINISHED', runId: 'never-started', text: 'Hello' })
    expect(window.send).not.toHaveBeenCalled()
  })

  it.each([
    ['finished', { type: 'RUN_FINISHED', runId: 'run-1', text: 'Hello' } as ClaudeEvent],
    ['failed', { type: 'RUN_ERROR', runId: 'run-1', error: 'boom' } as ClaudeEvent],
  ])('forgets a run once it has %s', async (_name, ending) => {
    await start('old', 'improve')

    emit(ending)
    window.send.mockClear()
    // Anything after the end belongs to no run.
    emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'late' })

    expect(window.send).not.toHaveBeenCalled()
  })

  it('cancels a run the asking window started', async () => {
    await start('old', 'improve')

    expect(cancel('run-1')).toEqual({ success: true, data: null })
    expect(runner.cancel).toHaveBeenCalledWith('run-1')
  })

  it.each([
    ['an id that is not a string', 42, window],
    ['a run nobody started', 'run-9', window],
    ['a run belonging to another window', 'run-1', createSender()],
  ])('refuses to cancel %s', async (_name, runId, sender) => {
    await start('old', 'improve')

    expect(cancel(runId, sender)).toEqual({ success: false, error: 'Unknown run' })
    expect(runner.cancel).not.toHaveBeenCalled()
  })

  it('says nothing more about a run once it was cancelled', async () => {
    await start('old', 'improve')
    await cancel('run-1')
    window.send.mockClear()

    emit({ type: 'RUN_ERROR', runId: 'run-1', error: 'too late' })

    expect(window.send).not.toHaveBeenCalled()
  })
})

describe('registerClaudeHandlers with the default run ids', () => {
  it('gives each run an id of its own', async () => {
    registerClaudeHandlers(() => runner)

    const first = await start('old', 'improve')
    const second = await start('old', 'improve again')

    expect(first).not.toEqual(second)
  })
})
