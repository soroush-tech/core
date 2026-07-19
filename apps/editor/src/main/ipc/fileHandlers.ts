import { dialog, ipcMain, type BrowserWindow } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { FILE_CHANNELS, type OpenedFile, type Result, type SavedFile } from '../../shared/ipc'

const MARKDOWN_FILTERS = [{ name: 'Markdown', extensions: ['md', 'markdown'] }]

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Asks the user whether to discard unsaved changes. Also used by the window close intercept. */
export async function confirmDiscard(window: BrowserWindow): Promise<boolean> {
  const { response } = await dialog.showMessageBox(window, {
    type: 'warning',
    buttons: ['Discard changes', 'Cancel'],
    defaultId: 1,
    cancelId: 1,
    message: 'You have unsaved changes. Discard them?',
  })
  return response === 0
}

export interface FileHandlerState {
  /** Mirrors the renderer's dirty flag so the close intercept can prompt. */
  isDirty: boolean
}

/** Disk access used by the handlers — injectable so they stay unit-testable. */
export interface FileIo {
  readFile: (path: string, encoding: 'utf8') => Promise<string>
  writeFile: (path: string, content: string, encoding: 'utf8') => Promise<void>
}

/**
 * Registers the file IPC handlers. Every response is Result-wrapped; a
 * cancelled dialog resolves to `data: null` rather than an error.
 */
export function registerFileHandlers(
  getWindow: () => BrowserWindow,
  io: FileIo = { readFile, writeFile }
): FileHandlerState {
  const state: FileHandlerState = { isDirty: false }

  ipcMain.handle(FILE_CHANNELS.open, async (): Promise<Result<OpenedFile | null>> => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(getWindow(), {
        properties: ['openFile'],
        filters: MARKDOWN_FILTERS,
      })
      if (canceled || filePaths.length === 0) return { success: true, data: null }
      const [filePath] = filePaths
      const content = await io.readFile(filePath, 'utf8')
      return { success: true, data: { filePath, content } }
    } catch (error) {
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle(
    FILE_CHANNELS.save,
    async (_event, filePath: unknown, content: unknown): Promise<Result<SavedFile | null>> => {
      if (typeof content !== 'string' || (filePath !== null && typeof filePath !== 'string')) {
        return { success: false, error: 'Invalid save arguments' }
      }
      try {
        let target = filePath
        if (target === null) {
          const { canceled, filePath: chosen } = await dialog.showSaveDialog(getWindow(), {
            filters: MARKDOWN_FILTERS,
            defaultPath: 'untitled.md',
          })
          if (canceled || !chosen) return { success: true, data: null }
          target = chosen
        }
        await io.writeFile(target, content, 'utf8')
        return { success: true, data: { filePath: target } }
      } catch (error) {
        return { success: false, error: toErrorMessage(error) }
      }
    }
  )

  ipcMain.handle(FILE_CHANNELS.setDirty, (_event, isDirty: unknown): Result<null> => {
    state.isDirty = isDirty === true
    return { success: true, data: null }
  })

  ipcMain.handle(FILE_CHANNELS.confirmDiscard, async (): Promise<Result<boolean>> => {
    try {
      return { success: true, data: await confirmDiscard(getWindow()) }
    } catch (error) {
      return { success: false, error: toErrorMessage(error) }
    }
  })

  return state
}
