import type { GistFile, Result } from '../../shared/ipc'
import { API_HEADERS, GISTS_URL } from './const'

/** The fields the editor needs from a gist file entry. */
interface RawGistFile {
  filename: string
  content: string
  /** GitHub cuts `content` off at 1MB and flags it; the whole file is at `raw_url`. */
  truncated: boolean
  raw_url: string
}

/**
 * Never hand back a partial file: loading truncated content into the editor and
 * saving it would silently drop the rest.
 */
async function toFile(raw: RawGistFile, fetchFn: typeof fetch): Promise<GistFile> {
  if (!raw.truncated) return { filename: raw.filename, content: raw.content }

  const response = await fetchFn(raw.raw_url, {
    headers: { 'user-agent': API_HEADERS['user-agent'] },
  })
  return { filename: raw.filename, content: response.ok ? await response.text() : raw.content }
}

/** Every file in one gist, with content, so picking one in the panel is instant. */
export async function fetchGistFiles(
  id: string,
  token: string,
  fetchFn: typeof fetch
): Promise<Result<GistFile[]>> {
  try {
    const response = await fetchFn(`${GISTS_URL}/${encodeURIComponent(id)}`, {
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

    const { files } = (await response.json()) as { files?: Record<string, RawGistFile> }
    if (!files) {
      return { success: false, error: 'Unexpected gist response from GitHub' }
    }
    return {
      success: true,
      data: await Promise.all(Object.values(files).map((f) => toFile(f, fetchFn))),
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
