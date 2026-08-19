/**
 * Success/failure envelope for every IPC response. Electron only serializes an
 * `Error`'s message across the boundary (stack/cause are lost), so failures
 * cross as plain strings instead of thrown errors.
 */
export type Result<T> = { success: true; data: T } | { success: false; error: string }

/** A document loaded from disk. */
export interface OpenedFile {
  filePath: string
  content: string
}

/** A document written to disk. */
export interface SavedFile {
  filePath: string
}

/**
 * What the user chose when told the document has unsaved changes. Two ways
 * out, both safe: keep the work or throw it away. There is no cancel, because
 * keeping it already costs nothing - a gist file is saved into the sandbox as
 * one more staged change, to be published alongside the others later.
 */
export type UnsavedChoice = 'save' | 'discard'

/** IPC channel names shared by main and preload so they cannot drift. */
export const FILE_CHANNELS = {
  open: 'file:open',
  save: 'file:save',
  setDirty: 'file:set-dirty',
  confirmDiscard: 'file:confirm-discard',
} as const

export const CLAUDE_CHANNELS = {
  startEdit: 'claude:start-edit',
  cancel: 'claude:cancel',
  /** Main → renderer: one `ClaudeEvent` per message of a run. */
  event: 'claude:event',
} as const

/**
 * What a run tells the renderer as it happens. The names are the AG-UI
 * (Agent-User Interaction) protocol's, so the vocabulary is a known quantity
 * rather than invented here - without taking the dependency. Tool-call and
 * state events are deliberately absent: the CLI runs with `--allowedTools ""`,
 * so they would be dead weight.
 *
 * `RUN_FINISHED` carries the whole text rather than leaving the renderer to
 * reassemble the deltas: the CLI's own final result is authoritative, and a
 * dropped delta must not quietly corrupt what lands in the document.
 */
export type ClaudeEvent =
  | { type: 'RUN_STARTED'; runId: string }
  | { type: 'TEXT_MESSAGE_CONTENT'; runId: string; delta: string }
  | { type: 'RUN_FINISHED'; runId: string; text: string }
  | { type: 'RUN_ERROR'; runId: string; error: string }

/** The signed-in GitHub account. Never carries the token - that stays in main. */
export interface GitHubStatus {
  login: string | null
  /** The avatar as a `data:` URI, so the renderer's CSP needs no remote image host. */
  avatar: string | null
}

/** One row of the gist list. Only what the panel renders - not the gist's content. */
export interface GistSummary {
  id: string
  /** The gist's description, or null when it has none. */
  description: string | null
  /** First filename, which is how GitHub itself titles a gist without a description. */
  filename: string
  fileCount: number
  isPublic: boolean
}

/** One file inside a gist, with its content ready to load into the document. */
export interface GistFile {
  filename: string
  content: string
}

/** What one gist holds on GitHub, from the single-gist endpoint. */
export interface GistContents {
  /** The published description, or null when it has none. */
  description: string | null
  files: GistFile[]
}

/**
 * One staged change to a gist file. `added` and `modified` carry the local
 * content; `deleted` needs none.
 */
export type GistDraftEntry =
  | { status: 'added' | 'modified'; content: string }
  | { status: 'deleted' }

/** Staged file changes, by filename. */
export type GistDraftFiles = Record<string, GistDraftEntry>

/** Everything staged for one gist. Empty files and no description means nothing to publish. */
export interface GistDraft {
  files: GistDraftFiles
  /** Present only when the description has been edited locally. */
  description?: string
}

/** Every gist that has unpublished changes, by gist id. */
export type GistDrafts = Record<string, GistDraft>

/**
 * Marks the sandbox for a gist that does not exist on GitHub yet. Not a real
 * gist id - GitHub's are hex - so it cannot collide with one, and publishing
 * such an id creates the gist rather than patching it.
 *
 * Each new gist gets its own id after the prefix, so starting one never
 * disturbs another still waiting to be published.
 */
export const NEW_GIST_PREFIX = 'new:'

/** A fresh sandbox id. Every call starts a gist of its own. */
export function newGistId(): string {
  return `${NEW_GIST_PREFIX}${crypto.randomUUID()}`
}

/** True for a gist that has never been published - see `NEW_GIST_PREFIX`. */
export function isNewGist(gistId: string): boolean {
  // 'new' was the single shared sandbox before each got its own id; a draft
  // left under it is still a gist that does not exist yet.
  return gistId === 'new' || gistId.startsWith(NEW_GIST_PREFIX)
}

/** Where a document came from, when it came from a gist rather than disk. */
export interface GistOrigin {
  gistId: string
  filename: string
}

export const GIST_CHANNELS = {
  list: 'github:gists',
  files: 'github:gist-files',
  draft: 'github:gist-draft',
  drafts: 'github:gist-drafts',
  stage: 'github:gist-stage',
  renameFile: 'github:gist-rename-file',
  stageDescription: 'github:gist-stage-description',
  reset: 'github:gist-reset',
  publish: 'github:gist-publish',
  /** Pushed after any draft change, so every view of that gist stays in step. */
  draftChanged: 'github:gist-draft-changed',
} as const

export interface GistDraftChange {
  gistId: string
  draft: GistDraft
}

export const GITHUB_CHANNELS = {
  status: 'github:status',
  signIn: 'github:sign-in',
  signOut: 'github:sign-out',
  openTokenSettings: 'github:open-token-settings',
} as const

/** An application-menu item the renderer must act on (it owns the document state). */
export type MenuAction = 'new' | 'open' | 'save' | 'save-as' | 'undo' | 'redo'

export const MENU_CHANNELS = {
  action: 'menu:action',
} as const
