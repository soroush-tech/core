import type { GistDraft, Result } from '../../shared/ipc'
import { API_HEADERS, EMPTY_FILE_CONTENT, GISTS_URL } from './const'

/**
 * Creates a gist from a draft that has never been published.
 *
 * Staged deletions are dropped rather than sent as nulls: there is nothing on
 * GitHub to delete yet, and `null` is not a valid file on create.
 */
export async function createGist(
  draft: GistDraft,
  isPublic: boolean,
  token: string,
  fetchFn: typeof fetch
): Promise<Result<string>> {
  const files: Record<string, { content: string }> = {}
  for (const [filename, entry] of Object.entries(draft.files)) {
    // Nothing is published yet, so a staged deletion has nothing to delete.
    if (entry.status === 'deleted') continue
    files[filename] = { content: entry.content || EMPTY_FILE_CONTENT }
  }

  if (Object.keys(files).length === 0) {
    return { success: false, error: 'Add a file before creating the gist' }
  }

  try {
    const response = await fetchFn(GISTS_URL, {
      method: 'POST',
      headers: {
        ...API_HEADERS,
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ description: draft.description ?? '', public: isPublic, files }),
    })

    if (response.status === 401) {
      return {
        success: false,
        error: 'GitHub rejected the stored token - connect the account again',
      }
    }
    if (response.status === 422) {
      return { success: false, error: 'GitHub would not accept one of these filenames' }
    }
    if (!response.ok) {
      return { success: false, error: `GitHub responded ${String(response.status)}` }
    }

    const { id } = (await response.json()) as { id?: unknown }
    if (typeof id !== 'string') {
      return { success: false, error: 'Unexpected gist response from GitHub' }
    }
    return { success: true, data: id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
