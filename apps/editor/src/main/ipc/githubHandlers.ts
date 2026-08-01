import { ipcMain, shell } from 'electron'
import { GITHUB_CHANNELS, type GitHubStatus, type Result } from '../../shared/ipc'
import type { AuthService } from '../github/authService'
import { TOKEN_SETTINGS_URL } from '../github/const'

/**
 * Registers the GitHub IPC handlers. The token crosses the bridge once, on
 * sign-in, and never travels back — `status` returns only the account name.
 */
export function registerGitHubHandlers(service: AuthService): void {
  ipcMain.handle(GITHUB_CHANNELS.status, async (): Promise<Result<GitHubStatus>> => ({
    success: true,
    data: await service.getStatus(),
  }))

  ipcMain.handle(
    GITHUB_CHANNELS.signIn,
    async (_event, token: unknown): Promise<Result<GitHubStatus>> => {
      if (typeof token !== 'string' || token.trim() === '') {
        return { success: false, error: 'Enter a personal access token' }
      }
      return service.signIn(token.trim())
    }
  )

  ipcMain.handle(GITHUB_CHANNELS.signOut, (): Promise<Result<null>> => service.signOut())

  // Always the constant — a renderer-supplied URL must never reach openExternal.
  ipcMain.handle(GITHUB_CHANNELS.openTokenSettings, async (): Promise<Result<null>> => {
    try {
      await shell.openExternal(TOKEN_SETTINGS_URL)
      return { success: true, data: null }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })
}
