import { EventEmitter } from 'node:events'
import { tmpdir } from 'node:os'
import type { spawn } from 'node:child_process'
import type { ClaudeEvent } from '../../shared/ipc'
import { buildStdin, CLAUDE_COMMAND, createClaudeRunner, EDIT_TIMEOUT_MS } from './runEdit'

interface FakeChild extends EventEmitter {
  stdout: EventEmitter
  stderr: EventEmitter
  stdin: { end: ReturnType<typeof vi.fn> }
  kill: ReturnType<typeof vi.fn>
}

function createFakeChild(): FakeChild {
  const child = new EventEmitter() as FakeChild
  child.stdout = new EventEmitter()
  child.stderr = new EventEmitter()
  child.stdin = { end: vi.fn() }
  child.kill = vi.fn()
  return child
}

const request = { selectedText: 'old text', instruction: 'make it shine' }

const delta = (text: string) =>
  `${JSON.stringify({
    type: 'stream_event',
    event: { type: 'content_block_delta', delta: { type: 'text_delta', text } },
  })}\n`

const result = (text: string) =>
  `${JSON.stringify({ type: 'result', subtype: 'success', result: text })}\n`

/** A runner wired to one fake child, with every event it emitted. */
function createRunner() {
  const child = createFakeChild()
  const events: ClaudeEvent[] = []
  const spawnFn = vi.fn(() => child) as unknown as typeof spawn
  const runner = createClaudeRunner(spawnFn, (event) => events.push(event))
  return { child, events, spawnFn, runner }
}

describe('CLAUDE_COMMAND', () => {
  it('is a fixed streaming invocation with tools disabled and no --bare', () => {
    expect(CLAUDE_COMMAND).toContain('claude -p')
    expect(CLAUDE_COMMAND).toContain('--output-format stream-json')
    // Without these the answer arrives in one lump at the end, or not at all.
    expect(CLAUDE_COMMAND).toContain('--include-partial-messages')
    expect(CLAUDE_COMMAND).toContain('--verbose')
    expect(CLAUDE_COMMAND).toContain('--permission-mode dontAsk')
    expect(CLAUDE_COMMAND).toContain('--allowedTools ""')
    expect(CLAUDE_COMMAND).not.toContain('--bare')
  })
})

describe('buildStdin', () => {
  it('carries both user-controlled blocks on stdin', () => {
    expect(buildStdin(request)).toBe('INSTRUCTION:\nmake it shine\n\nTEXT:\nold text')
  })

  it('puts referenced material first, as background to build on', () => {
    expect(buildStdin({ ...request, context: '# Rehydration' })).toBe(
      'CONTEXT:\n# Rehydration\n\nINSTRUCTION:\nmake it shine\n\nTEXT:\nold text'
    )
  })

  it('leaves the block out when there is nothing to refer to', () => {
    expect(buildStdin({ ...request, context: '' })).not.toContain('CONTEXT:')
  })
})

describe('EDIT_TASK_PROMPT', () => {
  it('tells the CLI the context is to build on, not to rewrite', () => {
    expect(CLAUDE_COMMAND).toContain('do not repeat it or rewrite it')
  })
})

describe('createClaudeRunner', () => {
  it('spawns away from any project folder, with the content on stdin', () => {
    const { child, spawnFn, runner } = createRunner()

    runner.start('run-1', request)

    expect(spawnFn).toHaveBeenCalledWith(CLAUDE_COMMAND, {
      shell: true,
      cwd: tmpdir(),
      timeout: EDIT_TIMEOUT_MS,
      windowsHide: true,
    })
    expect(child.stdin.end).toHaveBeenCalledWith(buildStdin(request))
  })

  it('reports the text as it is written, then the run’s own result', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    child.stdout.emit('data', delta('Hel'))
    child.stdout.emit('data', delta('lo'))
    child.stdout.emit('data', result('Hello'))
    child.emit('close', 0, null)

    expect(events).toEqual([
      { type: 'RUN_STARTED', runId: 'run-1' },
      { type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'Hel' },
      { type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'lo' },
      // Not the deltas glued together: the CLI's own result is what counts.
      { type: 'RUN_FINISHED', runId: 'run-1', text: 'Hello' },
    ])
  })

  it('passes over the lines that are not part of the answer', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    child.stdout.emit('data', `${JSON.stringify({ type: 'system', subtype: 'init' })}\n`)
    child.stdout.emit('data', result('Hello'))
    child.emit('close', 0, null)

    expect(events).toEqual([
      { type: 'RUN_STARTED', runId: 'run-1' },
      { type: 'RUN_FINISHED', runId: 'run-1', text: 'Hello' },
    ])
  })

  it('reads a result split across chunk boundaries', () => {
    const { child, events, runner } = createRunner()
    const line = result('Hello')

    runner.start('run-1', request)
    child.stdout.emit('data', line.slice(0, 20))
    child.stdout.emit('data', line.slice(20))
    child.emit('close', 0, null)

    expect(events.at(-1)).toEqual({ type: 'RUN_FINISHED', runId: 'run-1', text: 'Hello' })
  })

  it('keeps a character whose bytes arrived in two chunks', () => {
    const { child, events, runner } = createRunner()
    const bytes = Buffer.from(result('Hello 世界'), 'utf8')
    // Between the first and second byte of 世, where decoding each chunk on its
    // own would leave a replacement character in the middle of the answer.
    const split = bytes.indexOf(Buffer.from('世', 'utf8')) + 1

    runner.start('run-1', request)
    child.stdout.emit('data', bytes.subarray(0, split))
    child.stdout.emit('data', bytes.subarray(split))
    child.emit('close', 0, null)

    expect(events.at(-1)).toEqual({ type: 'RUN_FINISHED', runId: 'run-1', text: 'Hello 世界' })
  })

  it('names a missing CLI rather than reporting ENOENT', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    child.emit('error', new Error('spawn claude ENOENT'))

    expect(events.at(-1)).toEqual({
      type: 'RUN_ERROR',
      runId: 'run-1',
      error: 'Claude Code CLI not found - install it and sign in with `claude` first',
    })
  })

  it('passes any other spawn failure through, and says nothing more on close', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    child.emit('error', new Error('EACCES'))
    child.emit('close', 1, null)

    expect(events).toEqual([
      { type: 'RUN_STARTED', runId: 'run-1' },
      { type: 'RUN_ERROR', runId: 'run-1', error: 'EACCES' },
    ])
  })

  it('reports a failure the CLI declared in its result', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    child.stdout.emit(
      'data',
      `${JSON.stringify({ type: 'result', is_error: true, result: 'quota' })}\n`
    )
    child.emit('close', 0, null)

    expect(events.at(-1)).toEqual({ type: 'RUN_ERROR', runId: 'run-1', error: 'quota' })
  })

  it.each([
    ['what it printed on stderr', 'claude: bad flag\n', 'claude: bad flag'],
    ['the exit code when it printed nothing', '', 'Claude CLI exited with code 2'],
  ])('reports a non-zero exit with %s', (_name, stderr, error) => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    if (stderr !== '') child.stderr.emit('data', stderr)
    child.emit('close', 2, null)

    expect(events.at(-1)).toEqual({ type: 'RUN_ERROR', runId: 'run-1', error })
  })

  it('reports a run that was killed rather than answering', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    child.emit('close', null, 'SIGTERM')

    expect(events.at(-1)).toEqual({
      type: 'RUN_ERROR',
      runId: 'run-1',
      error: 'The Claude CLI stopped (SIGTERM)',
    })
  })

  it('reports a clean exit that never produced a result', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    child.stdout.emit('data', delta('half an answer'))
    child.emit('close', 0, null)

    expect(events.at(-1)).toEqual({
      type: 'RUN_ERROR',
      runId: 'run-1',
      error: 'The Claude CLI returned no result',
    })
  })

  it('ends a cancelled run quietly, with nothing to apply', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    child.stdout.emit('data', delta('half an answer'))
    runner.cancel('run-1')
    child.emit('close', null, 'SIGTERM')

    expect(child.kill).toHaveBeenCalled()
    // The panel asked for this and has already gone back to idle.
    expect(events.filter((event) => event.type !== 'TEXT_MESSAGE_CONTENT')).toEqual([
      { type: 'RUN_STARTED', runId: 'run-1' },
    ])
  })

  it('drops what a cancelled run writes on its way out', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    runner.cancel('run-1')
    // Killing the child does not stop what it had already written from arriving,
    // and the last of it is held back until the close flush. The document is the
    // user's own again by now, so none of it may reach the renderer.
    child.stdout.emit('data', delta('too late'))
    child.stdout.emit('data', delta('later still').trimEnd())
    child.emit('close', null, 'SIGTERM')

    expect(events).toEqual([{ type: 'RUN_STARTED', runId: 'run-1' }])
  })

  it('says nothing when a cancelled run fails to die', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    runner.cancel('run-1')
    // The kill itself went wrong. The panel is idle and asked for this, so the
    // failure is of the killing rather than of the run.
    child.emit('error', new Error('kill ESRCH'))

    expect(events).toEqual([{ type: 'RUN_STARTED', runId: 'run-1' }])
  })

  it('stays silent for what arrives after a cancelled run has already ended', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    runner.cancel('run-1')
    child.emit('error', new Error('kill ESRCH'))
    // The run is over twice by now — stopped, then ended. What the child had
    // already written is still on its way, and none of it is an answer.
    child.stdout.emit('data', delta('too late'))
    child.stdout.emit('data', result('later still'))
    child.emit('close', null, 'SIGTERM')

    expect(events).toEqual([{ type: 'RUN_STARTED', runId: 'run-1' }])
  })

  it('ignores a cancel for a run it does not have', () => {
    const { child, runner } = createRunner()

    runner.start('run-1', request)
    runner.cancel('run-2')

    expect(child.kill).not.toHaveBeenCalled()
  })

  it('flushes a last line that arrived without its newline', () => {
    const { child, events, runner } = createRunner()

    runner.start('run-1', request)
    child.stdout.emit('data', result('Hello').trimEnd())
    child.emit('close', 0, null)

    expect(events.at(-1)).toEqual({ type: 'RUN_FINISHED', runId: 'run-1', text: 'Hello' })
  })
})
