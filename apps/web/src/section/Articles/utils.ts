import type { GistShort } from 'src/types/github'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Formats an ISO timestamp as `MMM D, YYYY` (e.g. `Apr 28, 2025`). */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

const BYTES_PER_WORD = 5

/**
 * Rough word count for a gist, estimated from its files' byte sizes - the gists
 * list endpoint omits file content, so size is the only available signal.
 */
export function estimateWordCount(files: GistShort['files']): number {
  const bytes = Object.values(files).reduce((sum, file) => sum + file.size, 0)
  return Math.round(bytes / BYTES_PER_WORD)
}
