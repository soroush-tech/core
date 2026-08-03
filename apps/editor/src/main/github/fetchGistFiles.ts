import type { GistFile, Result } from '../../shared/ipc'
import { API_HEADERS, GISTS_URL } from './const'
import { NOT_A_GIST_ID, toGistId } from './toGistId'

/** Where GitHub serves gist file content that was too big to inline. */
const RAW_HOST = 'gist.githubusercontent.com'

/**
 * Whether a `raw_url` is one of GitHub's own, and so safe to follow. It arrives
 * in a response rather than being built here, and a request must not be sent
 * wherever that response happens to point.
 */
function isGistRawUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url)
    return protocol === 'https:' && hostname === RAW_HOST
  } catch {
    return false
  }
}

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

  // Handing back the truncated content would look like a whole file, and
  // publishing what came back would cut the gist down to it. Failing the read
  // is the only safe answer.
  if (!isGistRawUrl(raw.raw_url)) {
    throw new Error(`GitHub gave no usable address for the rest of ${raw.filename}`)
  }

  const response = await fetchFn(raw.raw_url, {
    headers: { 'user-agent': API_HEADERS['user-agent'] },
  })
  if (!response.ok) {
    throw new Error(`Could not read all of ${raw.filename} — GitHub responded ${response.status}`)
  }
  return { filename: raw.filename, content: await response.text() }
}

/** Every file in one gist, with content, so picking one in the panel is instant. */
export async function fetchGistFiles(
  id: string,
  token: string,
  fetchFn: typeof fetch
): Promise<Result<GistFile[]>> {
  const gistId = toGistId(id)
  if (gistId === null) return { success: false, error: NOT_A_GIST_ID }

  try {
    const response = await fetchFn(`${GISTS_URL}/${gistId}`, {
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
