import type { GistSummary } from '../../../../../shared/ipc'

/**
 * What a gist goes by in the picker: its description, or what it holds when it
 * has none — the summary carries counts rather than filenames, so there is
 * nothing else to name it after. A description of nothing but spaces is no name
 * either, and would leave a row in the list blank.
 */
export function toGistLabel({ description, fileCount }: GistSummary): string {
  const named = description?.trim()
  if (named) return named

  const held = fileCount === 1 ? '1 file' : `${String(fileCount)} files`
  return `Untitled · ${held}`
}
