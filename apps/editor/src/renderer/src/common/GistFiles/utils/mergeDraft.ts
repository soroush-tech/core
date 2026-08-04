import type { GistDraftFiles, GistFile } from '../../../../../shared/ipc'

export interface DraftedFile {
  filename: string
  /** Local content where the file is staged, otherwise what GitHub has. */
  content: string
  /** null when the file matches the gist as published. */
  status: 'added' | 'modified' | 'deleted' | null
}

/**
 * Lays the local draft over the gist's published files: remote files first, in
 * GitHub's order, then anything that exists only locally. A staged deletion
 * keeps its row — it is a pending change to show, not a file to hide.
 */
export function mergeDraft(files: GistFile[], staged: GistDraftFiles): DraftedFile[] {
  const merged = files.map((file) => {
    const entry = staged[file.filename]
    if (!entry) return { ...file, status: null }
    return {
      filename: file.filename,
      content: entry.status === 'deleted' ? file.content : entry.content,
      status: entry.status,
    }
  })

  const remote = new Set(files.map((file) => file.filename))
  const added: DraftedFile[] = []
  for (const [filename, entry] of Object.entries(staged)) {
    // A deletion staged against a file the gist no longer has is nothing to show.
    if (remote.has(filename) || entry.status === 'deleted') continue
    added.push({ filename, content: entry.content, status: entry.status })
  }

  return [...merged, ...added]
}
