import type { Result } from '../../shared/ipc'
import { API_HEADERS, AVATAR_SIZE, REQUIRED_PERMISSION, USER_URL } from './const'

export interface GitHubAccount {
  login: string
  /** The avatar as a `data:` URI, or null when it could not be fetched. */
  avatar: string | null
}

/**
 * Inlines the avatar as a data URI rather than handing the renderer a URL.
 * The renderer's CSP is `img-src 'self' data:` - keeping it that way means no
 * remote image host has to be allowed, and no request leaves the app when the
 * sidebar paints.
 */
async function fetchAvatar(avatarUrl: string, fetchFn: typeof fetch): Promise<string | null> {
  try {
    const url = new URL(avatarUrl)
    url.searchParams.set('s', String(AVATAR_SIZE))

    const response = await fetchFn(url, { headers: { 'user-agent': API_HEADERS['user-agent'] } })
    if (!response.ok) return null

    const contentType = response.headers.get('content-type') ?? 'image/png'
    const bytes = Buffer.from(await response.arrayBuffer())
    return `data:${contentType};base64,${bytes.toString('base64')}`
  } catch {
    // A missing avatar is cosmetic - the account is still perfectly usable.
    return null
  }
}

/**
 * Resolves the account a token belongs to. Doubles as the token check: a token
 * GitHub will not accept never reaches the credential store.
 */
export async function fetchAccount(
  token: string,
  fetchFn: typeof fetch
): Promise<Result<GitHubAccount>> {
  try {
    const response = await fetchFn(USER_URL, {
      headers: { ...API_HEADERS, authorization: `Bearer ${token}` },
    })
    if (response.status === 401) {
      return {
        success: false,
        error: `GitHub rejected that token - check it was copied whole, has not expired, and grants "${REQUIRED_PERMISSION}"`,
      }
    }
    if (!response.ok) {
      return { success: false, error: `GitHub responded ${String(response.status)}` }
    }

    const { login, avatar_url: avatarUrl } = (await response.json()) as {
      login?: unknown
      avatar_url?: unknown
    }
    if (typeof login !== 'string') {
      return { success: false, error: 'Unexpected account response from GitHub' }
    }

    const avatar = typeof avatarUrl === 'string' ? await fetchAvatar(avatarUrl, fetchFn) : null
    return { success: true, data: { login, avatar } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
