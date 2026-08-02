/**
 * The drag payload for a gist. A private type rather than `text/plain`, so a
 * drop target only accepts gists dragged out of this app — dropping a text
 * selection or a file on it does nothing.
 */
export const GIST_DRAG_TYPE = 'application/x-soroush-gist'

/** Marks a drag as carrying this gist. */
export function startGistDrag(dataTransfer: DataTransfer, gistId: string): void {
  dataTransfer.setData(GIST_DRAG_TYPE, gistId)
  // Referring to a gist neither moves nor copies it.
  dataTransfer.effectAllowed = 'link'
}

/** Whether what is being dragged is one of this app's gists. */
export function isGistDrag(dataTransfer: DataTransfer): boolean {
  return [...dataTransfer.types].includes(GIST_DRAG_TYPE)
}

/** The dragged gist's id, or null when the drag carries something else. */
export function readGistDrag(dataTransfer: DataTransfer): string | null {
  return dataTransfer.getData(GIST_DRAG_TYPE) || null
}
