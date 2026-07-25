import { ipcMain } from 'electron'
import { CLAUDE_CHANNELS, type Result } from '../../shared/ipc'
import type { EditSelectionRequest } from '../claude/editSelection'

/**
 * Registers the Claude IPC handler. `runEdit` is the CLI bridge —
 * main/index.ts wires it to `editSelection` with the real `spawn`.
 */
export function registerClaudeHandlers(
  runEdit: (request: EditSelectionRequest) => Promise<Result<string>>
): void {
  ipcMain.handle(
    CLAUDE_CHANNELS.editSelection,
    async (_event, selectedText: unknown, instruction: unknown): Promise<Result<string>> => {
      // An empty selectedText is valid: it means "write new content" (the
      // renderer sends the whole document, which may be empty).
      if (
        typeof selectedText !== 'string' ||
        typeof instruction !== 'string' ||
        instruction.trim() === ''
      ) {
        return { success: false, error: 'Invalid edit request' }
      }
      return runEdit({ selectedText, instruction })
    }
  )
}
