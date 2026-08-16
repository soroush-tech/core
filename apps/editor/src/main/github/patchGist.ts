import type { GistDraft, GistDraftFiles, Result } from '../../shared/ipc'
import { API_HEADERS, EMPTY_FILE_CONTENT, GISTS_URL } from './const'
import { NOT_A_GIST_ID, toGistId } from './toGistId'

/** GitHub's file map: content to write, or null to delete. */
type FilePatch = Record<string, { content: string } | null>

/**
 * Turns staged files into GitHub's `files` map - added/modified write, deleted
 * null out. Empty content becomes a blank line, which GitHub accepts where the
 * empty string is a 422.
 */
export function toFilePatch(files: GistDraftFiles): FilePatch {
  return Object.fromEntries(
    Object.entries(files).map(([filename, entry]) => [
      filename,
      entry.status === 'deleted' ? null : { content: entry.content || EMPTY_FILE_CONTENT },
    ])
  )
}

/**
 * Publishes a whole draft in one request: the staged files, and the description
 * when it was edited. Only staged filenames appear in the map, so every other
 * file in the gist keeps its content untouched.
 */
export async function patchGist(
  id: string,
  draft: GistDraft,
  token: string,
  fetchFn: typeof fetch
): Promise<Result<null>> {
  const gistId = toGistId(id)
  if (gistId === null) return { success: false, error: NOT_A_GIST_ID }

  try {
    const response = await fetchFn(`${GISTS_URL}/${gistId}`, {
      method: 'PATCH',
      headers: {
        ...API_HEADERS,
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        files: toFilePatch(draft.files),
        ...(draft.description !== undefined && { description: draft.description }),
      }),
    })

    if (response.status === 401) {
      return {
        success: false,
        error: 'GitHub rejected the stored token - connect the account again',
      }
    }
    if (response.status === 422) {
      return {
        success: false,
        error:
          'GitHub rejected these changes - check the filenames, and that the gist keeps at least one file',
      }
    }
    if (!response.ok) {
      return { success: false, error: `GitHub responded ${String(response.status)}` }
    }
    return { success: true, data: null }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
