import { dialog, ipcMain, type BrowserWindow } from 'electron'
import {
  GIST_CHANNELS,
  type GistDraft,
  type GistDraftEntry,
  type GistContents,
  type GistDrafts,
  type GistSummary,
  type Result,
} from '../../shared/ipc'
import type { GistService } from '../github/gistService'
import { toGistId, toNewGistId } from '../github/toGistId'

/** Gists are flat, so a path separator is never a valid gist filename. */
const PATH_SEPARATOR = /[/\\]/

function validateId(id: unknown): Result<string> {
  // The id reaches a request URL and a key in the draft file, so only the shape
  // GitHub actually issues is let through — not merely "some non-blank string".
  // A gist that does not exist yet has no id from GitHub to check it against,
  // so the sandbox ids this app mints for one are matched by their own shape.
  const trimmed = typeof id === 'string' ? id.trim() : null
  const gistId = trimmed === null ? null : (toNewGistId(trimmed) ?? toGistId(trimmed))
  if (gistId === null) return { success: false, error: 'Invalid gist id' }
  return { success: true, data: gistId }
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

  ipcMain.handle(
    GIST_CHANNELS.files,
    async (_event, id: unknown): Promise<Result<GistContents>> => {
      const gistId = validateId(id)
      if (!gistId.success) return gistId
      return service.files(gistId.data)
    }
  )

  ipcMain.handle(GIST_CHANNELS.drafts, async (): Promise<Result<GistDrafts>> => ({
    success: true,
    data: await service.drafts(),
  }))

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
    GIST_CHANNELS.renameFile,
    async (_event, id: unknown, from: unknown, to: unknown, content: unknown) => {
      const gistId = validateId(id)
      if (!gistId.success) return gistId
      const oldName = validateFilename(from)
      if (!oldName.success) return oldName
      const newName = validateFilename(to)
      if (!newName.success) return newName
      if (typeof content !== 'string') return { success: false, error: 'Invalid file content' }

      const renamed = await service.renameFile(gistId.data, oldName.data, newName.data, content)
      if (renamed.success) await announce(gistId.data)
      return renamed
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

  ipcMain.handle(
    GIST_CHANNELS.publish,
    async (_event, id: unknown, isPublic: unknown): Promise<Result<string>> => {
      const gistId = validateId(id)
      if (!gistId.success) return gistId

      // Anything but an explicit true keeps a new gist secret.
      const result = await service.publish(gistId.data, isPublic === true)
      if (result.success) await announce(gistId.data)
      return result
    }
  )
}
