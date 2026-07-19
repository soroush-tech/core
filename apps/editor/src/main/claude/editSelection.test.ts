import { EventEmitter } from 'node:events'
import { tmpdir } from 'node:os'
import type { spawn } from 'node:child_process'
import {
  buildStdin,
  CLAUDE_COMMAND,
  EDIT_TIMEOUT_MS,
  editSelection,
  parseCliOutput,
} from './editSelection'

interface FakeChild extends EventEmitter {
  stdout: EventEmitter
  stderr: EventEmitter
  stdin: { end: ReturnType<typeof vi.fn> }
}

function createFakeChild(): FakeChild {
  const child = new EventEmitter() as FakeChild
  child.stdout = new EventEmitter()
  child.stderr = new EventEmitter()
  child.stdin = { end: vi.fn() }
  return child
}

const request = { selectedText: 'old text', instruction: 'make it shine' }

describe('CLAUDE_COMMAND', () => {
  it('is a fixed one-shot json invocation with tools disabled and no --bare', () => {
    expect(CLAUDE_COMMAND).toContain('claude -p')
    expect(CLAUDE_COMMAND).toContain('--output-format json')
    expect(CLAUDE_COMMAND).toContain('--permission-mode dontAsk')
    expect(CLAUDE_COMMAND).toContain('--allowedTools ""')
    expect(CLAUDE_COMMAND).not.toContain('--bare')
  })
})

describe('buildStdin', () => {
  it('carries both user-controlled blocks on stdin', () => {
    expect(buildStdin(request)).toBe('INSTRUCTION:\nmake it shine\n\nTEXT:\nold text')
  })
})

describe('parseCliOutput', () => {
  it('extracts the result field', () => {
    expect(parseCliOutput(JSON.stringify({ result: 'new text' }))).toEqual({
      success: true,
      data: 'new text',
    })
  })

  it('rejects non-JSON output', () => {
    expect(parseCliOutput('garbage')).toEqual({
      success: false,
      error: 'Could not parse the Claude CLI response as JSON',
    })
  })

  it('rejects a response without a string result', () => {
    expect(parseCliOutput(JSON.stringify({ result: 42 }))).toEqual({
      success: false,
      error: 'Unexpected Claude CLI response shape',
    })
  })

  it('surfaces an is_error response as the error message', () => {
    expect(parseCliOutput(JSON.stringify({ result: 'quota exceeded', is_error: true }))).toEqual({
      success: false,
      error: 'quota exceeded',
    })
  })
})

describe('editSelection', () => {
  it('spawns the fixed command from the OS temp dir and pipes the request via stdin', async () => {
    const child = createFakeChild()
    const spawnFn = vi.fn().mockReturnValue(child) as unknown as typeof spawn
    const pending = editSelection(request, spawnFn)

    expect(spawnFn).toHaveBeenCalledWith(CLAUDE_COMMAND, {
      shell: true,
      cwd: tmpdir(),
      timeout: EDIT_TIMEOUT_MS,
      windowsHide: true,
    })
    expect(child.stdin.end).toHaveBeenCalledWith(buildStdin(request))

    child.stdout.emit('data', '{"result":')
    child.stdout.emit('data', '"new text"}')
    child.emit('close', 0)
    await expect(pending).resolves.toEqual({ success: true, data: 'new text' })
  })

  it('reports stderr on a non-zero exit', async () => {
    const child = createFakeChild()
    const pending = editSelection(
      request,
      vi.fn().mockReturnValue(child) as unknown as typeof spawn
    )
    child.stderr.emit('data', 'not logged in\n')
    child.emit('close', 1)
    await expect(pending).resolves.toEqual({ success: false, error: 'not logged in' })
  })

  it('falls back to the exit code when stderr is empty', async () => {
    const child = createFakeChild()
    const pending = editSelection(
      request,
      vi.fn().mockReturnValue(child) as unknown as typeof spawn
    )
    child.emit('close', null)
    await expect(pending).resolves.toEqual({
      success: false,
      error: 'Claude CLI exited with code null',
    })
  })

  it('maps ENOENT to an install hint', async () => {
    const child = createFakeChild()
    const pending = editSelection(
      request,
      vi.fn().mockReturnValue(child) as unknown as typeof spawn
    )
    child.emit('error', new Error('spawn claude ENOENT'))
    await expect(pending).resolves.toEqual({
      success: false,
      error: 'Claude Code CLI not found - install it and sign in with `claude` first',
    })
  })

  it('passes other spawn errors through', async () => {
    const child = createFakeChild()
    const pending = editSelection(
      request,
      vi.fn().mockReturnValue(child) as unknown as typeof spawn
    )
    child.emit('error', new Error('EPERM'))
    await expect(pending).resolves.toEqual({ success: false, error: 'EPERM' })
  })
})
