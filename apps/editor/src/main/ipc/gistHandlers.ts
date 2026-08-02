import { dialog, ipcMain, type BrowserWindow } from 'electron'
import {
  GIST_CHANNELS,
  type GistDraft,
  type GistDraftEntry,
  type GistFile,
  type GistSummary,
  type Result,
} from '../../shared/ipc'
import type { GistService } from '../github/gistService'

/** Gists are flat, so a path separator is never a valid gist filename. */
const PATH_SEPARATOR = /[/\\]/

function validateId(id: unknown): Result<string> {
  if (typeof id !== 'string' || id.trim() === '') {
    return { success: false, error: 'Invalid gist id' }
  }
  return { success: true, data: id }
}

function validateFilename(filename: unknown): Result<string> {
  if (typeof filename !== 'string' || filename.trim() === '') {
    return { success: false, error: 'Enter a filename' }
  }
  if (PATH_SEPARATOR.test(filename)) {
    return { success: false, error: 'A gist filename cannot contain a path separator' }
  }
  return { success: true, data: filename.trim() }
}

/** Resetting throws away work that exists nowhere else, so it is confirmed first. */
async function confirmReset(window: BrowserWindow): Promise<boolean> {
  const { response } = await dialog.showMessageBox(window, {
    type: 'warning',
    buttons: ['Discard changes', 'Cancel'],
    defaultId: 1,
    cancelId: 1,
    message: 'Discard every unpublished change to this gist?',
  })
  return response === 0
}

/** Registers the gist IPC handlers. The token is never an argument — main holds it. */
export function registerGistHandlers(service: GistService, getWindow: () => BrowserWindow): void {
  /**
   * Tells the renderer the draft moved. The editor and the files panel both
   * hold a view of it, and only one of them made the change — without this the
   * other keeps showing a stale change count.
   */
  const announce = async (gistId: string): Promise<void> => {
    getWindow().webContents.send(GIST_CHANNELS.draftChanged, {
      gistId,
      draft: await service.draft(gistId),
    })
  }

  ipcMain.handle(GIST_CHANNELS.list, (): Promise<Result<GistSummary[]>> => service.list())

  ipcMain.handle(GIST_CHANNELS.files, async (_event, id: unknown): Promise<Result<GistFile[]>> => {
    const gistId = validateId(id)
    if (!gistId.success) return gistId
    return service.files(gistId.data)
  })

  ipcMain.handle(GIST_CHANNELS.draft, async (_event, id: unknown): Promise<Result<GistDraft>> => {
    const gistId = validateId(id)
    if (!gistId.success) return gistId
    return { success: true, data: await service.draft(gistId.data) }
  })

  ipcMain.handle(
    GIST_CHANNELS.stage,
    async (
      _event,
      id: unknown,
      filename: unknown,
      entry: GistDraftEntry | null
    ): Promise<Result<GistDraft>> => {
      const gistId = validateId(id)
      if (!gistId.success) return gistId
      const name = validateFilename(filename)
      if (!name.success) return name

      const staged = await service.stage(gistId.data, name.data, entry)
      if (staged.success) await announce(gistId.data)
      return staged
    }
  )

  ipcMain.handle(
    GIST_CHANNELS.stageDescription,
    async (_event, id: unknown, description: unknown): Promise<Result<GistDraft>> => {
      const gistId = validateId(id)
      if (!gistId.success) return gistId
      if (description !== null && typeof description !== 'string') {
        return { success: false, error: 'Invalid description' }
      }

      const staged = await service.stageDescription(gistId.data, description)
      if (staged.success) await announce(gistId.data)
      return staged
    }
  )

  /** Resolves `data: false` when the user cancels — cancelling is not a failure. */
  ipcMain.handle(GIST_CHANNELS.reset, async (_event, id: unknown): Promise<Result<boolean>> => {
    const gistId = validateId(id)
    if (!gistId.success) return gistId

    if (!(await confirmReset(getWindow()))) return { success: true, data: false }

    const result = await service.reset(gistId.data)
    if (!result.success) return result
    await announce(gistId.data)
    return { success: true, data: true }
  })

  ipcMain.handle(GIST_CHANNELS.publish, async (_event, id: unknown): Promise<Result<null>> => {
    const gistId = validateId(id)
    if (!gistId.success) return gistId

    const result = await service.publish(gistId.data)
    if (result.success) await announce(gistId.data)
    return result
  })
}
