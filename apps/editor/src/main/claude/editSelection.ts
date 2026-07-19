import type { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import type { Result } from '../../shared/ipc'

export interface EditSelectionRequest {
  selectedText: string
  instruction: string
}

const EDIT_TASK_PROMPT =
  'Rewrite the TEXT block according to the INSTRUCTION block, both provided on stdin. ' +
  'Output only the rewritten text - no explanations, no commentary, no code fences around the result.'

/**
 * The full CLI invocation as one constant string: every flag is fixed and all
 * user content travels over stdin, so nothing user-controlled ever reaches the
 * shell. Deliberately NOT `--bare` — bare mode skips the OAuth/keychain reads,
 * and reusing the signed-in user's own `claude` login is the point.
 */
export const CLAUDE_COMMAND = `claude -p "${EDIT_TASK_PROMPT}" --output-format json --permission-mode dontAsk --allowedTools ""`

export const EDIT_TIMEOUT_MS = 120_000

export function buildStdin({ selectedText, instruction }: EditSelectionRequest): string {
  return `INSTRUCTION:\n${instruction}\n\nTEXT:\n${selectedText}`
}

/** Parses `--output-format json` output; the rewritten text is the `result` field. */
export function parseCliOutput(stdout: string): Result<string> {
  let parsed: unknown
  try {
    parsed = JSON.parse(stdout)
  } catch {
    return { success: false, error: 'Could not parse the Claude CLI response as JSON' }
  }
  const { result, is_error: isError } = parsed as { result?: unknown; is_error?: unknown }
  if (typeof result !== 'string') {
    return { success: false, error: 'Unexpected Claude CLI response shape' }
  }
  if (isError === true) return { success: false, error: result }
  return { success: true, data: result }
}

/**
 * Runs one selection edit through the local `claude` CLI. Spawned from the OS
 * temp dir (never a project folder) so no repo CLAUDE.md/hooks/MCP config
 * bleeds into the request; `spawnFn` is injected so this stays unit-testable —
 * the real `spawn` is wired in main/index.ts.
 */
export function editSelection(
  request: EditSelectionRequest,
  spawnFn: typeof spawn
): Promise<Result<string>> {
  return new Promise((resolve) => {
    const child = spawnFn(CLAUDE_COMMAND, {
      shell: true,
      cwd: tmpdir(),
      timeout: EDIT_TIMEOUT_MS,
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (chunk: Buffer | string) => {
      stdout += String(chunk)
    })
    child.stderr?.on('data', (chunk: Buffer | string) => {
      stderr += String(chunk)
    })

    child.on('error', (error) => {
      const message = error.message.includes('ENOENT')
        ? 'Claude Code CLI not found - install it and sign in with `claude` first'
        : error.message
      resolve({ success: false, error: message })
    })

    child.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: stderr.trim() || `Claude CLI exited with code ${String(code)}`,
        })
        return
      }
      resolve(parseCliOutput(stdout))
    })

    child.stdin?.end(buildStdin(request))
  })
}
