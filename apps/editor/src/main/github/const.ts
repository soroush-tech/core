export const USER_URL = 'https://api.github.com/user'

/** Where the user creates the token, pre-filtered to fine-grained tokens. */
export const TOKEN_SETTINGS_URL = 'https://github.com/settings/personal-access-tokens/new'

/** The one permission the token needs — shown in the UI and required for gists. */
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
