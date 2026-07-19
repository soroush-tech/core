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
      if (
        typeof selectedText !== 'string' ||
        selectedText === '' ||
        typeof instruction !== 'string' ||
        instruction.trim() === ''
      ) {
        return { success: false, error: 'Invalid edit request' }
      }
      return runEdit({ selectedText, instruction })
    }
  )
}
