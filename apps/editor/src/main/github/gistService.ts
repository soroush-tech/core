import {
  isNewGist,
  type GistDraft,
  type GistDraftEntry,
  type GistContents,
  type GistDrafts,
  type GistSummary,
  type Result,
} from '../../shared/ipc'
import { createGist } from './createGist'
import type { CredentialStore } from './credentialStore'
import { isEmptyDraft, type DraftStore } from './draftStore'
import { fetchGistFiles } from './fetchGistFiles'
import { fetchGists } from './fetchGists'
import { patchGist } from './patchGist'

export interface GistServiceDeps {
  fetchFn: typeof fetch
  store: CredentialStore
  drafts: DraftStore
}

export interface GistService {
  list: () => Promise<Result<GistSummary[]>>
  files: (id: string) => Promise<Result<GistContents>>
  draft: (id: string) => Promise<GistDraft>
  /** Every gist with unpublished changes, so the rail can offer a way back to them. */
  drafts: () => Promise<GistDrafts>
  /** Stages one file change, or clears it when `entry` is null. Returns the new draft. */
  stage: (id: string, filename: string, entry: GistDraftEntry | null) => Promise<Result<GistDraft>>
  /**
   * Renames a staged or published file as one change, so a rename can never
   * come apart into a deletion without its replacement.
   */
  renameFile: (id: string, from: string, to: string, content: string) => Promise<Result<GistDraft>>
  /** Stages a description, or clears the staged one when `description` is null. */
  stageDescription: (id: string, description: string | null) => Promise<Result<GistDraft>>
  reset: (id: string) => Promise<Result<null>>
  /**
   * `isPublic` only applies to the new-gist sandbox, which publishing creates.
   * Resolves with the id that now holds the work: the created gist's for a
   * sandbox, and the same id back for one that already existed — so the caller
   * can follow a sandbox to what it became.
   */
  publish: (id: string, isPublic: boolean) => Promise<Result<string>>
}

const SIGNED_OUT = 'Connect a GitHub account to see your gists'

/**
 * The gists API plus the local sandbox. Nothing staged reaches GitHub until
 * `publish`, which sends the whole draft as one request; `reset` throws it away.
 */
export function createGistService({ fetchFn, store, drafts }: GistServiceDeps): GistService {
  return {
    async list() {
      const credentials = await store.read()
      if (!credentials) return { success: false, error: SIGNED_OUT }
      return fetchGists(credentials.token, fetchFn)
    },

    async files(id) {
      // A gist that does not exist yet has no published files — only staged ones.
      if (isNewGist(id)) return { success: true, data: { description: null, files: [] } }

      const credentials = await store.read()
      if (!credentials) return { success: false, error: SIGNED_OUT }
      return fetchGistFiles(id, credentials.token, fetchFn)
    },

    draft: (id) => drafts.read(id),

    drafts: () => drafts.list(),

    // Both stage calls go through `update`, so the draft they change is the one
    // on disk at that moment rather than a snapshot read earlier.
    stage: (id, filename, entry) =>
      drafts.update(id, (draft) => {
        const files = { ...draft.files }

        if (entry === null) {
          delete files[filename]
        } else if (
          entry.status === 'modified' &&
          (isNewGist(id) || files[filename]?.status === 'added')
        ) {
          // Nothing is published in a gist that does not exist yet, and a file
          // that exists only locally stays "added" however often it is edited.
          files[filename] = { status: 'added', content: entry.content }
        } else {
          files[filename] = entry
        }

        return { ...draft, files }
      }),

    // One step, so the old name and the new one cannot disagree: a rename that
    // staged the deletion and then failed would leave the file gone with nothing
    // in its place — and what is staged exists nowhere else.
    async renameFile(id, from, to, content) {
      // Read inside the update rather than before it, so the check and the write
      // cannot be separated by another change to the same draft.
      let taken = false
      const updated = await drafts.update(id, (draft) => {
        // Renaming onto a name that is holding staged work would drop it, and
        // staged work exists nowhere else. A destination staged as deleted is
        // fair game: writing over it is what bringing the file back means.
        if (draft.files[to] !== undefined && draft.files[to].status !== 'deleted') {
          taken = true
          return draft
        }

        const files = { ...draft.files }
        // A file GitHub has must be staged as deleted, which is what a rename is
        // in a gist PATCH; one that only exists here just moves key.
        if (files[from]?.status === 'added') delete files[from]
        else files[from] = { status: 'deleted' }
        files[to] = { status: 'added', content }
        return { ...draft, files }
      })
      if (taken) return { success: false, error: `${to} has unpublished changes` }
      return updated
    },

    stageDescription: (id, description) =>
      drafts.update(id, (draft) => {
        if (description !== null) return { ...draft, description }
        const { description: _staged, ...rest } = draft
        return rest
      }),

    reset: (id) => drafts.clear(id),

    async publish(id, isPublic) {
      const credentials = await store.read()
      if (!credentials) return { success: false, error: SIGNED_OUT }

      const draft = await drafts.read(id)
      if (isEmptyDraft(draft)) return { success: false, error: 'Nothing to publish' }

      // A gist that does not exist yet is created; an existing one is patched.
      const published = isNewGist(id)
        ? await createGist(draft, isPublic, credentials.token, fetchFn)
        : await patchGist(id, draft, credentials.token, fetchFn)

      // The draft is only dropped once GitHub has it — a failed publish keeps the work.
      if (!published.success) return published

      // Whether the sandbox could be tidied away afterwards does not change what
      // happened: GitHub has the work. Reporting the cleanup's failure instead
      // would invite the one retry that must never happen — publishing a sandbox
      // twice is two gists, and the second is not a correction of the first.
      await drafts.clear(id)
      return { success: true, data: published.data ?? id }
    },
  }
}
