import type { GitHubStatus, Result } from '../../shared/ipc'
import type { CredentialStore } from './credentialStore'
import { fetchAccount } from './fetchAccount'

export interface AuthServiceDeps {
  fetchFn: typeof fetch
  store: CredentialStore
}

export interface AuthService {
  getStatus: () => Promise<GitHubStatus>
  signIn: (token: string) => Promise<Result<GitHubStatus>>
  signOut: () => Promise<Result<null>>
}

const SIGNED_OUT: GitHubStatus = { login: null, avatar: null }

/**
 * Owns the account session: a personal access token is checked against GitHub
 * before it is stored, so a bad token fails loudly instead of sitting on disk
 * waiting to break the first gist.
 */
export function createAuthService({ fetchFn, store }: AuthServiceDeps): AuthService {
  return {
    async getStatus() {
      const credentials = await store.read()
      if (!credentials) return SIGNED_OUT
      return { login: credentials.login, avatar: credentials.avatar }
    },

    async signIn(token) {
      const account = await fetchAccount(token, fetchFn)
      if (!account.success) return account

      const saved = await store.write({ ...account.data, token })
      if (!saved.success) return saved

      return { success: true, data: { login: account.data.login, avatar: account.data.avatar } }
    },

    signOut: () => store.clear(),
  }
}
