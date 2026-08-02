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
  /** Stages a description, or clears the staged one when `description` is null. */
  stageDescription: (id: string, description: string | null) => Promise<Result<GistDraft>>
  reset: (id: string) => Promise<Result<null>>
  /** `isPublic` only applies to the new-gist sandbox, which publishing creates. */
  publish: (id: string, isPublic: boolean) => Promise<Result<null>>
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
      return drafts.clear(id)
    },
  }
}
