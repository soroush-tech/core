import type { GistSummary, Result } from '../../shared/ipc'
import { API_HEADERS, GISTS_MAX_PAGES, GISTS_PAGE_SIZE, GISTS_URL } from './const'

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
 * Every gist the signed-in user has, newest first - GitHub's default ordering,
 * which is what the panel wants.
 *
 * GitHub pages this endpoint, so a short page is the last one and anything
 * else means there is more to fetch. Pages are requested in sequence rather
 * than at once: the total is unknown until the last one arrives.
 */
export async function fetchGists(
  token: string,
  fetchFn: typeof fetch
): Promise<Result<GistSummary[]>> {
  const gists: GistSummary[] = []

  try {
    for (let page = 1; page <= GISTS_MAX_PAGES; page++) {
      const url = new URL(GISTS_URL)
      url.searchParams.set('per_page', String(GISTS_PAGE_SIZE))
      url.searchParams.set('page', String(page))

      const response = await fetchFn(url, {
        headers: { ...API_HEADERS, authorization: `Bearer ${token}` },
      })
      if (response.status === 401) {
        return {
          success: false,
          error: 'GitHub rejected the stored token - connect the account again',
        }
      }
      if (!response.ok) {
        return { success: false, error: `GitHub responded ${String(response.status)}` }
      }

      const payload = (await response.json()) as unknown
      if (!Array.isArray(payload)) {
        return { success: false, error: 'Unexpected gist response from GitHub' }
      }

      gists.push(...(payload as RawGist[]).map(toSummary))
      // A page that is not full is the last one - no need to ask for another.
      if (payload.length < GISTS_PAGE_SIZE) break
      // A full last page means there are more, and this promised every gist.
      // Saying so beats handing back a list that only looks complete.
      if (page === GISTS_MAX_PAGES) {
        return {
          success: false,
          error: `You have more than ${String(GISTS_MAX_PAGES * GISTS_PAGE_SIZE)} gists - more than this can list`,
        }
      }
    }

    return { success: true, data: gists }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
