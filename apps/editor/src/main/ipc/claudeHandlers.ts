import { randomUUID } from 'node:crypto'
import { ipcMain, type WebContents } from 'electron'
import { CLAUDE_CHANNELS, type ClaudeEvent, type Result } from '../../shared/ipc'
import type { ClaudeRunner } from '../claude/runEdit'

/**
 * Registers the Claude IPC handlers. The runner is built here rather than
 * passed in, so the one map of who-asked-for-what owns both the routing of
 * events and the right to cancel: a run's events go back to the WebContents
 * that started it - never broadcast - and no other window can stop it.
 */
export function registerClaudeHandlers(
  createRunner: (emit: (event: ClaudeEvent) => void) => ClaudeRunner,
  newRunId: () => string = randomUUID
): void {
  const listeners = new Map<string, WebContents>()

  const runner = createRunner((event) => {
    const contents = listeners.get(event.runId)
    // A run that already ended has nobody to tell.
    if (!contents) return
    // A window closed mid-run: sending to it throws, and the CLI is answering
    // nobody. Forgotten and killed, rather than left writing into the dark.
    if (contents.isDestroyed()) {
      listeners.delete(event.runId)
      runner.cancel(event.runId)
      return
    }
    if (event.type === 'RUN_FINISHED' || event.type === 'RUN_ERROR') listeners.delete(event.runId)
    contents.send(CLAUDE_CHANNELS.event, event)
  })

  ipcMain.handle(
    CLAUDE_CHANNELS.startEdit,
    (event, selectedText: unknown, instruction: unknown, context: unknown): Result<string> => {
      // An empty selectedText is valid: it means "write new content" (the
      // renderer sends the whole document, which may be empty).
      if (
        typeof selectedText !== 'string' ||
        typeof instruction !== 'string' ||
        instruction.trim() === '' ||
        (context != null && typeof context !== 'string')
      ) {
        return { success: false, error: 'Invalid edit request' }
      }

      const runId = newRunId()
      listeners.set(runId, event.sender)
      runner.start(runId, { selectedText, instruction, context: context ?? undefined })
      return { success: true, data: runId }
    }
  )

  ipcMain.handle(CLAUDE_CHANNELS.cancel, (event, runId: unknown): Result<null> => {
    if (typeof runId !== 'string' || listeners.get(runId) !== event.sender) {
      return { success: false, error: 'Unknown run' }
    }
    listeners.delete(runId)
    runner.cancel(runId)
    return { success: true, data: null }
  })
}
