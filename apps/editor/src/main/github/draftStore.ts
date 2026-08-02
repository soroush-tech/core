import type { GistDraft, GistDraftFiles, Result } from '../../shared/ipc'

/** Disk access for the drafts file — injectable, like the other stores. */
export interface DraftFileIo {
  readFile: (path: string, encoding: 'utf8') => Promise<string>
  writeFile: (path: string, content: string, encoding: 'utf8') => Promise<void>
}

export interface DraftStore {
  read: (gistId: string) => Promise<GistDraft>
  write: (gistId: string, draft: GistDraft) => Promise<Result<null>>
  clear: (gistId: string) => Promise<Result<null>>
}

const empty = (): GistDraft => ({ files: {} })

/** True once a draft holds nothing worth keeping. */
export function isEmptyDraft(draft: GistDraft): boolean {
  return Object.keys(draft.files).length === 0 && draft.description === undefined
}

/**
 * Drafts written before descriptions could be staged are a bare file map.
 * Reading them as one keeps that work rather than discarding it.
 */
function toDraft(stored: unknown): GistDraft {
  const draft = stored as Partial<GistDraft> | undefined
  if (!draft) return empty()
  if (!draft.files) return { files: stored as GistDraftFiles }
  return {
    files: draft.files,
    ...(draft.description !== undefined && { description: draft.description }),
  }
}

/**
 * Unpublished gist edits, kept as plain JSON beside the app's other user data
 * and keyed by gist id. Not encrypted: this is the user's own draft text, not
 * a credential — the token it will eventually be published with lives in
 * `credentialStore` instead.
 */
export function createDraftStore(filePath: string, io: DraftFileIo): DraftStore {
  const readAll = async (): Promise<Record<string, unknown>> => {
    try {
      return JSON.parse(await io.readFile(filePath, 'utf8')) as Record<string, unknown>
    } catch {
      // No file yet, or one we cannot parse — either way there is nothing staged.
      return {}
    }
  }

  const writeAll = async (drafts: Record<string, unknown>): Promise<Result<null>> => {
    try {
      await io.writeFile(filePath, JSON.stringify(drafts), 'utf8')
      return { success: true, data: null }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  return {
    async read(gistId) {
      return toDraft((await readAll())[gistId])
    },

    async write(gistId, draft) {
      const drafts = await readAll()
      // An emptied draft is dropped, so a published gist leaves no husk behind.
      if (isEmptyDraft(draft)) delete drafts[gistId]
      else drafts[gistId] = draft
      return writeAll(drafts)
    },

    async clear(gistId) {
      const drafts = await readAll()
      delete drafts[gistId]
      return writeAll(drafts)
    },
  }
}
