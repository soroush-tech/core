import type { GistFile } from '../../../../../shared/ipc'

/**
 * How much of a referenced gist is sent. A long article is worth having in
 * full; a whole gist of transcripts is not worth the wait, and the CLI would
 * spend the run reading rather than writing.
 */
export const CONTEXT_LIMIT = 60_000

export interface GistContext {
  /** The material itself, ready for the CONTEXT block. Empty when there is none. */
  text: string
  /** True when the gist was too long to send whole. */
  isTrimmed: boolean
}

/**
 * Lays a gist out as background material: its description, then each file
 * under its own heading, so the referenced work reads as a document rather
 * than a wall of concatenated text.
 */
export function toContext(description: string | null, files: GistFile[]): GistContext {
  const parts = description?.trim() ? [`# ${description.trim()}`] : []
  for (const file of files) parts.push(`## ${file.filename}\n${file.content}`)

  const text = parts.join('\n\n')
  if (text.length <= CONTEXT_LIMIT) return { text, isTrimmed: false }
  return { text: text.slice(0, CONTEXT_LIMIT), isTrimmed: true }
}
