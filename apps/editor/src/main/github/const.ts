export const USER_URL = 'https://api.github.com/user'
export const GISTS_URL = 'https://api.github.com/gists'

/** Kept small so each request stays light; the fetch pages until the list is complete. */
export const GISTS_PAGE_SIZE = 10

/**
 * Stops a malformed response from paging forever. At 10 a page this is 1000
 * gists - past any real account, so hitting it means something is wrong rather
 * than that the user has that many.
 */
export const GISTS_MAX_PAGES = 100

/**
 * What an empty file is published as. GitHub rejects a gist file whose content
 * is the empty string with a 422, so a blank line stands in for it - otherwise
 * adding a file and publishing before typing anything could never succeed.
 */
export const EMPTY_FILE_CONTENT = '\n'

/** Where the user creates the token, pre-filtered to fine-grained tokens. */
export const TOKEN_SETTINGS_URL = 'https://github.com/settings/personal-access-tokens/new'

/** The one permission the token needs - shown in the UI and required for gists. */
export const REQUIRED_PERMISSION = 'Gists: Read and write'

/** Avatar edge in px, requested from GitHub so the inlined data URI stays small. */
export const AVATAR_SIZE = 64

export const API_HEADERS = {
  accept: 'application/vnd.github+json',
  'user-agent': 'soroush-editor',
  'x-github-api-version': '2022-11-28',
}

/** Encrypted credential file, relative to the app's userData directory. */
export const CREDENTIALS_FILE = 'github-credentials.bin'

/** Unpublished gist edits, relative to the app's userData directory. */
export const DRAFTS_FILE = 'gist-drafts.json'
