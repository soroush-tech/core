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

/** IPC channel names shared by main and preload so they cannot drift. */
export const FILE_CHANNELS = {
  open: 'file:open',
  save: 'file:save',
  setDirty: 'file:set-dirty',
  confirmDiscard: 'file:confirm-discard',
} as const
