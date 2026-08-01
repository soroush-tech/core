import { safeStorage } from 'electron'
import type { Result } from '../../shared/ipc'

export interface GitHubCredentials {
  login: string
  token: string
  /** The avatar as a `data:` URI, stored so the rail paints offline and instantly. */
  avatar: string | null
}

/** Disk access for the credential file — injectable, like the file handlers' `FileIo`. */
export interface CredentialFileIo {
  readFile: (path: string) => Promise<Buffer>
  writeFile: (path: string, data: Buffer) => Promise<void>
  rm: (path: string, options: { force: true }) => Promise<void>
}

export interface CredentialStore {
  read: () => Promise<GitHubCredentials | null>
  write: (credentials: GitHubCredentials) => Promise<Result<null>>
  clear: () => Promise<Result<null>>
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * The GitHub token at rest. Only ciphertext ever reaches disk — the file is
 * written exclusively through `encryptStringAsync`, and a plaintext write is
 * impossible because the token never leaves this module unencrypted. The
 * renderer only ever sees the `login` the token is paired with.
 *
 * The async safeStorage API throughout: non-blocking, key-rotation aware, and
 * the synchronous pair may be deprecated in a future Electron.
 */
export function createCredentialStore(filePath: string, io: CredentialFileIo): CredentialStore {
  const write = async (credentials: GitHubCredentials): Promise<Result<null>> => {
    if (!(await safeStorage.isAsyncEncryptionAvailable())) {
      return { success: false, error: 'This system has no secure storage for a GitHub token' }
    }
    try {
      const encrypted = await safeStorage.encryptStringAsync(JSON.stringify(credentials))
      await io.writeFile(filePath, encrypted)
      return { success: true, data: null }
    } catch (error) {
      return { success: false, error: toErrorMessage(error) }
    }
  }

  const read = async (): Promise<GitHubCredentials | null> => {
    try {
      const { result, shouldReEncrypt } = await safeStorage.decryptStringAsync(
        await io.readFile(filePath)
      )
      const { login, token, avatar } = JSON.parse(result) as Partial<GitHubCredentials>
      if (typeof login !== 'string' || typeof token !== 'string') return null

      const credentials = { login, token, avatar: typeof avatar === 'string' ? avatar : null }
      // The OS rotated the key, or offers a stronger one — restore the file under
      // it. A failed rewrite leaves the old ciphertext, which still decrypts.
      if (shouldReEncrypt) await write(credentials)
      return credentials
    } catch {
      // No file yet, a key from another OS user, or a corrupt file — all mean signed out.
      return null
    }
  }

  const clear = async (): Promise<Result<null>> => {
    try {
      await io.rm(filePath, { force: true })
      return { success: true, data: null }
    } catch (error) {
      return { success: false, error: toErrorMessage(error) }
    }
  }

  return { read, write, clear }
}
