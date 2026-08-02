import type { GistSummary, Result } from '../../shared/ipc'
import { API_HEADERS, GISTS_PAGE_SIZE, GISTS_URL } from './const'

/** The fields the panel needs from GitHub's gist payload. */
interface RawGist {
  id: string
  description: string | null
  files: Record<string, unknown>
  public: boolean
}

const toSummary = ({ id, description, files, public: isPublic }: RawGist): GistSummary => {
  const filenames = Object.keys(files)
  return {
    id,
    // GitHub stores "no description" as an empty string as well as null.
    description: description?.trim() ? description : null,
    filename: filenames[0] ?? 'untitled',
    fileCount: filenames.length,
    isPublic,
  }
}

/**
 * The signed-in user's gists, newest first — GitHub's default ordering, which
 * is what the panel wants. One page only: this is a rail, not an archive.
 */
export async function fetchGists(
  token: string,
  fetchFn: typeof fetch
): Promise<Result<GistSummary[]>> {
  try {
    const url = new URL(GISTS_URL)
    url.searchParams.set('per_page', String(GISTS_PAGE_SIZE))

    const response = await fetchFn(url, {
      headers: { ...API_HEADERS, authorization: `Bearer ${token}` },
    })
    if (response.status === 401) {
      return {
        success: false,
        error: 'GitHub rejected the stored token — connect the account again',
      }
    }
    if (!response.ok) {
      return { success: false, error: `GitHub responded ${String(response.status)}` }
    }

    const payload = (await response.json()) as unknown
    if (!Array.isArray(payload)) {
      return { success: false, error: 'Unexpected gist response from GitHub' }
    }
    return { success: true, data: (payload as RawGist[]).map(toSummary) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
