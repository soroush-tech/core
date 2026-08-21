import { ipcMain, type BrowserWindow } from 'electron'
import type { autoUpdater } from 'electron-updater'
import { UPDATE_CHANNELS, type Result } from '../shared/ipc'

/** The slice of electron-updater the wiring uses, so tests can hand in a plain object. */
export type Updater = Pick<typeof autoUpdater, 'checkForUpdates' | 'on' | 'quitAndInstall'>

/**
 * Asks GitHub Releases for a newer build and downloads it in the background
 * (where the artifacts come from is electron-builder.yml's `publish`). Once it
 * is on disk the renderer is told its version and shows the update banner;
 * the banner's button answers back on `install`, which restarts into the new
 * version - silently, straight back into the editor. Quitting without ever
 * pressing it installs the update too (electron-updater installs a downloaded
 * update on quit by default), so the banner is an invitation, not a chore.
 *
 * Packaged builds only: a dev or e2e run was never installed, so there is
 * nothing for an update to replace. A failed check is logged and nothing
 * more - the editor works fine as the version it already is.
 */
export function startAutoUpdates(
  isPackaged: boolean,
  updater: Updater,
  getWindow: () => BrowserWindow | null
): void {
  if (!isPackaged) return

  updater.on('update-downloaded', (info) => {
    getWindow()?.webContents.send(UPDATE_CHANNELS.downloaded, info.version)
  })

  ipcMain.handle(UPDATE_CHANNELS.install, (): Result<null> => {
    // Silent install, then straight back into the (new) editor. A dirty
    // document still gets its say: quitting runs the same unsaved-changes
    // guard as any other close.
    updater.quitAndInstall(true, true)
    return { success: true, data: null }
  })

  updater.checkForUpdates().catch((error: unknown) => {
    console.error('Update check failed', error)
  })
}
