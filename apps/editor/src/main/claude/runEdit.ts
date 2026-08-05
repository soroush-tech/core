import type { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { StringDecoder } from 'node:string_decoder'
import type { ClaudeEvent } from '../../shared/ipc'
import { createLineReader, parseStreamLine } from './parseStream'

export interface EditSelectionRequest {
  selectedText: string
  instruction: string
  /** Background material — another gist to build on. Empty when there is none. */
  context?: string
}

const EDIT_TASK_PROMPT =
  'Rewrite the TEXT block according to the INSTRUCTION block, both provided on stdin. ' +
  'If the TEXT block is empty, write new content that satisfies the INSTRUCTION block. ' +
  'A CONTEXT block, when present, is earlier work to build on - refer to it, but do not ' +
  'repeat it or rewrite it. ' +
  'Output only the rewritten text - no explanations, no commentary, no code fences around the result.'

/**
 * The full CLI invocation as one constant string: every flag is fixed and all
 * user content travels over stdin, so nothing user-controlled ever reaches the
 * shell. Deliberately NOT `--bare` — bare mode skips the OAuth/keychain reads,
 * and reusing the signed-in user's own `claude` login is the point.
 *
 * `--include-partial-messages` is what makes the answer arrive as it is
 * written rather than in one lump at the end; `--verbose` is required by the
 * CLI for streamed output under `-p`.
 */
export const CLAUDE_COMMAND =
  `claude -p "${EDIT_TASK_PROMPT}" --output-format stream-json --include-partial-messages ` +
  `--verbose --permission-mode dontAsk --allowedTools ""`

export const EDIT_TIMEOUT_MS = 120_000

const NOT_INSTALLED = 'Claude Code CLI not found - install it and sign in with `claude` first'

export function buildStdin({ selectedText, instruction, context }: EditSelectionRequest): string {
  const blocks = context ? [`CONTEXT:\n${context}`] : []
  blocks.push(`INSTRUCTION:\n${instruction}`, `TEXT:\n${selectedText}`)
  return blocks.join('\n\n')
}

export interface ClaudeRunner {
  /** Spawns a run and reports it through `emit`. Returns once it has started. */
  start: (runId: string, request: EditSelectionRequest) => void
  /** Kills a run in flight. Unknown ids are ignored — it may have just finished. */
  cancel: (runId: string) => void
}

/**
 * Runs selection edits through the local `claude` CLI, one child per run,
 * keyed by `runId` so it can be killed. Spawned from the OS temp dir (never a
 * project folder) so no repo CLAUDE.md/hooks/MCP config bleeds into the
 * request; `spawnFn` is injected so this stays unit-testable.
 */
export function createClaudeRunner(
  spawnFn: typeof spawn,
  emit: (event: ClaudeEvent) => void
): ClaudeRunner {
  const running = new Map<string, ReturnType<typeof spawn>>()
  // Runs the user stopped. They end without an event: the panel asked for this
  // and has already gone back to idle, and there is nothing to apply.
  const cancelled = new Set<string>()

  return {
    start(runId, request) {
      const child = spawnFn(CLAUDE_COMMAND, {
        shell: true,
        cwd: tmpdir(),
        timeout: EDIT_TIMEOUT_MS,
        windowsHide: true,
      })
      running.set(runId, child)
      emit({ type: 'RUN_STARTED', runId })

      // Set by the terminal `result` line, and only then is the run a success:
      // an exit without one means the CLI stopped before answering.
      let finished: string | null = null
      let failure: string | null = null
      let stderr = ''

      const reader = createLineReader((line) => {
        const parsed = parseStreamLine(line)
        if (parsed.kind === 'delta')
          emit({ type: 'TEXT_MESSAGE_CONTENT', runId, delta: parsed.text })
        else if (parsed.kind === 'result') finished = parsed.text
        else if (parsed.kind === 'error') failure = parsed.message
      })

      // One decoder for the whole run: a chunk can end halfway through a character,
      // and decoding each on its own would leave a replacement character in the
      // middle of the answer. What it holds back is flushed when the child closes.
      const stdout = new StringDecoder('utf8')
      child.stdout?.on('data', (chunk: Buffer | string) =>
        reader.push(stdout.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
      )
      child.stderr?.on('data', (chunk: Buffer | string) => {
        stderr += String(chunk)
      })

      child.on('error', (error) => {
        running.delete(runId)
        emit({
          type: 'RUN_ERROR',
          runId,
          error: error.message.includes('ENOENT') ? NOT_INSTALLED : error.message,
        })
      })

      child.on('close', (code, signal) => {
        // Already reported through 'error' — nothing here to add.
        if (!running.delete(runId)) return
        reader.push(stdout.end())
        reader.end()

        if (cancelled.delete(runId)) return

        if (failure !== null) return emit({ type: 'RUN_ERROR', runId, error: failure })
        if (signal !== null) {
          return emit({ type: 'RUN_ERROR', runId, error: `The Claude CLI stopped (${signal})` })
        }
        if (code !== 0) {
          return emit({
            type: 'RUN_ERROR',
            runId,
            error: stderr.trim() || `Claude CLI exited with code ${String(code)}`,
          })
        }
        if (finished === null) {
          return emit({ type: 'RUN_ERROR', runId, error: 'The Claude CLI returned no result' })
        }
        emit({ type: 'RUN_FINISHED', runId, text: finished })
      })

      child.stdin?.end(buildStdin(request))
    },

    cancel(runId) {
      const child = running.get(runId)
      if (!child) return
      cancelled.add(runId)
      child.kill()
    },
  }
}
