import { app, dialog, type BrowserWindow } from 'electron'

/**
 * The About dialog, spelled out rather than taken as the `about` role.
 *
 * The role defers to whatever the platform provides, which differs between macOS, Windows and
 * Linux and needs `app.setAboutPanelOptions` before it shows anything at all on two of them. This
 * is one message box, identical everywhere, and it can be asserted on in a test.
 *
 * The runtime versions are here because they are what a bug report needs and what nobody can find
 * on their own: `app.getVersion()` answers "which build", `process.versions` answers "on what".
 */
export function aboutMessage(): { message: string; detail: string } {
  const { electron, chrome, node } = process.versions
  return {
    message: `Soroush Editor ${app.getVersion()}`,
    detail: [`Electron ${electron}`, `Chromium ${chrome}`, `Node ${node}`].join('\n'),
  }
}

/** Shows the About dialog, owned by `window` when one is open so it cannot be lost behind it. */
export function showAboutDialog(window: BrowserWindow | null): void {
  const { message, detail } = aboutMessage()
  const options = { type: 'info' as const, title: 'About', message, detail, buttons: ['OK'] }
  if (window === null || window.isDestroyed()) {
    void dialog.showMessageBox(options)
    return
  }
  void dialog.showMessageBox(window, options)
}
