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
 * keeping it already costs nothing — a gist file is saved into the sandbox as
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
  editSelection: 'claude:edit-selection',
} as const

/** The signed-in GitHub account. Never carries the token — that stays in main. */
export interface GitHubStatus {
  login: string | null
  /** The avatar as a `data:` URI, so the renderer's CSP needs no remote image host. */
  avatar: string | null
}

/** One row of the gist list. Only what the panel renders — not the gist's content. */
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

/**
 * One staged change to a gist file. `added` and `modified` carry the local
 * content; `deleted` needs none.
 */
export type GistDraftEntry =
  { status: 'added' | 'modified'; content: string } | { status: 'deleted' }

/** Staged file changes, by filename. */
export type GistDraftFiles = Record<string, GistDraftEntry>

/** Everything staged for one gist. Empty files and no description means nothing to publish. */
export interface GistDraft {
  files: GistDraftFiles
  /** Present only when the description has been edited locally. */
  description?: string
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
  stage: 'github:gist-stage',
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
