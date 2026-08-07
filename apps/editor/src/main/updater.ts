import type { autoUpdater } from 'electron-updater'

/** The one method the wiring uses, so tests can hand in a plain object. */
export type Updater = Pick<typeof autoUpdater, 'checkForUpdatesAndNotify'>

/**
 * Asks GitHub Releases for a newer build and installs it in the background
 * (where the artifacts come from is electron-builder.yml's `publish`).
 * Packaged builds only: a dev or e2e run was never installed, so there is
 * nothing for an update to replace. A failed check is logged and nothing
 * more — the editor works fine as the version it already is.
 */
export function startAutoUpdates(isPackaged: boolean, updater: Updater): void {
  if (!isPackaged) return
  updater.checkForUpdatesAndNotify().catch((error: unknown) => {
    console.error('Update check failed', error)
  })
}
