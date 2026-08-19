import type { GistDraft, GistDraftFiles, GistDrafts, Result } from '../../shared/ipc'

/** Disk access for the drafts file - injectable, like the other stores. */
export interface DraftFileIo {
  readFile: (path: string, encoding: 'utf8') => Promise<string>
  writeFile: (path: string, content: string, encoding: 'utf8') => Promise<void>
  rename: (from: string, to: string) => Promise<void>
}

export interface DraftStore {
  read: (gistId: string) => Promise<GistDraft>
  /** Every gist with something staged - how the rail finds work left unfinished. */
  list: () => Promise<GistDrafts>
  /**
   * Reads a draft, changes it and writes it back as one step - nothing else
   * touches the file in between, so two panels staging at once cannot drop each
   * other's work. Returns the draft as it now stands.
   */
  update: (gistId: string, change: (draft: GistDraft) => GistDraft) => Promise<Result<GistDraft>>
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
 * a credential - the token it will eventually be published with lives in
 * `credentialStore` instead.
 */
export function createDraftStore(filePath: string, io: DraftFileIo): DraftStore {
  // Every operation is a read-modify-write over one file, so they take turns:
  // two overlapping ones would each read the same snapshot and the later write
  // would drop the earlier change - unpublished work that exists nowhere else.
  let queue: Promise<unknown> = Promise.resolve()

  const serially = <T>(task: () => Promise<T>): Promise<T> => {
    // The queue never rejects, so a failed operation cannot stop the ones
    // behind it - each still waits its turn.
    const run = queue.then(task)
    queue = run.catch(() => undefined)
    return run
  }

  const readAll = async (): Promise<Record<string, unknown>> => {
    try {
      return JSON.parse(await io.readFile(filePath, 'utf8')) as Record<string, unknown>
    } catch {
      // No file yet, or one we cannot parse - either way there is nothing staged.
      return {}
    }
  }

  /**
   * Writes beside the file and renames over it. A write interrupted halfway
   * would otherwise leave a truncated file, which reads back as no drafts at
   * all - every gist's staged work gone, without an error.
   */
  const writeAll = async (drafts: Record<string, unknown>): Promise<Result<null>> => {
    const temporary = `${filePath}.tmp`
    try {
      await io.writeFile(temporary, JSON.stringify(drafts), 'utf8')
      await io.rename(temporary, filePath)
      return { success: true, data: null }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  return {
    read: (gistId) => serially(async () => toDraft((await readAll())[gistId])),

    list: () =>
      serially(async () => {
        const drafts: GistDrafts = {}
        for (const [gistId, stored] of Object.entries(await readAll())) {
          const draft = toDraft(stored)
          // A husk left by an interrupted write is not something to offer.
          if (!isEmptyDraft(draft)) drafts[gistId] = draft
        }
        return drafts
      }),

    update: (gistId, change) =>
      serially(async () => {
        const drafts = await readAll()
        const draft = change(toDraft(drafts[gistId]))

        // An emptied draft is dropped, so a published gist leaves no husk behind.
        if (isEmptyDraft(draft)) delete drafts[gistId]
        else drafts[gistId] = draft

        const written = await writeAll(drafts)
        return written.success ? { success: true, data: draft } : written
      }),

    clear: (gistId) =>
      serially(async () => {
        const drafts = await readAll()
        delete drafts[gistId]
        return writeAll(drafts)
      }),
  }
}
