import type { GistContents, GistFile, Result } from '../../shared/ipc'
import { API_HEADERS, GISTS_URL } from './const'
import { NOT_A_GIST_ID, toGistId } from './toGistId'

const RAW_PROTOCOLS = ['https:']

/** Where GitHub serves gist file content that was too big to inline. */
const RAW_HOSTS = ['gist.githubusercontent.com']

/** `new URL` throws on a string that is not one, and a gist can carry anything. */
function toUrl(url: string): URL | null {
  try {
    return new URL(url)
  } catch {
    return null
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

  // The address arrives in a response rather than being written here, so it is
  // checked against GitHub's own before anything is requested from it. Handing
  // back the truncated content instead would look like a whole file, and
  // publishing what came back would cut the gist down to it. Failing the read
  // is the only safe answer.
  const rawUrl = toUrl(raw.raw_url)
  if (
    rawUrl === null ||
    !RAW_PROTOCOLS.includes(rawUrl.protocol) ||
    !RAW_HOSTS.includes(rawUrl.hostname)
  ) {
    throw new Error(`GitHub gave no usable address for the rest of ${raw.filename}`)
  }
  // Only the path it asked for is kept; anything else the address carried goes.
  rawUrl.search = ''
  rawUrl.hash = ''

  const response = await fetchFn(rawUrl, {
    headers: { 'user-agent': API_HEADERS['user-agent'] },
    // The host is pinned, so a redirect is the only way this request could
    // leave GitHub. Refusing to follow one keeps that shut.
    redirect: 'error',
  })
  if (!response.ok) {
    throw new Error(`Could not read all of ${raw.filename} — GitHub responded ${response.status}`)
  }
  return { filename: raw.filename, content: await response.text() }
}

/**
 * One gist's description and every file in it, with content, so picking a file
 * in the panel is instant. The description comes from here rather than from a
 * list row, so a gist opened by id alone still knows its own.
 */
export async function fetchGistFiles(
  id: string,
  token: string,
  fetchFn: typeof fetch
): Promise<Result<GistContents>> {
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

    const { files, description } = (await response.json()) as {
      files?: Record<string, RawGistFile>
      description?: unknown
    }
    if (!files) {
      return { success: false, error: 'Unexpected gist response from GitHub' }
    }
    return {
      success: true,
      data: {
        // GitHub stores "no description" as an empty string as well as null.
        description: typeof description === 'string' && description.trim() ? description : null,
        files: await Promise.all(Object.values(files).map((f) => toFile(f, fetchFn))),
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
