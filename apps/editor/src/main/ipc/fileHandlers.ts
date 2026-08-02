import { dialog, ipcMain, type BrowserWindow } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import {
  FILE_CHANNELS,
  type OpenedFile,
  type Result,
  type SavedFile,
  type UnsavedChoice,
} from '../../shared/ipc'

const MARKDOWN_FILTERS = [{ name: 'Markdown', extensions: ['md', 'markdown'] }]

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Asks what to do about unsaved changes. Also used by the window close
 * intercept.
 *
 * Keeping the work is the default *and* the Escape action, so no accidental
 * dismissal loses anything. `isDraft` names it honestly: a gist file is kept
 * by staging it in the sandbox, where it waits with the other changes until
 * they are published together.
 */
export async function confirmDiscard(
  window: BrowserWindow,
  isDraft: boolean
): Promise<UnsavedChoice> {
  const { response } = await dialog.showMessageBox(window, {
    type: 'warning',
    buttons: [isDraft ? 'Save as draft' : 'Save', 'Discard changes'],
    defaultId: 0,
    cancelId: 0,
    message: 'This document has unsaved changes.',
  })
  return response === 1 ? 'discard' : 'save'
}

export interface FileHandlerState {
  /** Mirrors the renderer's dirty flag so the close intercept can prompt. */
  isDirty: boolean
  /** Whether the open document belongs to a gist, so the prompt can name the draft. */
  isDraft: boolean
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
  const state: FileHandlerState = { isDirty: false, isDraft: false }

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

  ipcMain.handle(
    FILE_CHANNELS.setDirty,
    (_event, isDirty: unknown, isDraft: unknown): Result<null> => {
      state.isDirty = isDirty === true
      state.isDraft = isDraft === true
      return { success: true, data: null }
    }
  )

  ipcMain.handle(FILE_CHANNELS.confirmDiscard, async (): Promise<Result<UnsavedChoice>> => {
    try {
      return { success: true, data: await confirmDiscard(getWindow(), state.isDraft) }
    } catch (error) {
      return { success: false, error: toErrorMessage(error) }
    }
  })

  return state
}
