import { BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron'
import type { MenuAction } from '../shared/ipc'
import { showAboutDialog } from './about'

/**
 * The application menu. File actions and Undo/Redo run in the renderer (it
 * owns the document state), so every item just forwards its MenuAction over
 * IPC via `send`. Undo/Redo accelerators are display-only
 * (`registerAccelerator: false`): the renderer already binds those keys
 * (useUndoRedo), and registering them here would swallow the keydown.
 *
 * The View menu is spelled out rather than taken as the `viewMenu` role: the
 * role ships Reload on Ctrl+R and Force Reload, which throw the document away
 * with no questions asked. Reload here is menu-only - no accelerator - and
 * `onReload` routes it through main's unsaved-changes guard.
 */
export function createMenuTemplate(
  send: (action: MenuAction) => void,
  onReload: () => void
): MenuItemConstructorOptions[] {
  return [
    {
      label: 'File',
      submenu: [
        { id: 'file-new', label: 'New', accelerator: 'CmdOrCtrl+N', click: () => send('new') },
        {
          id: 'file-open',
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => send('open'),
        },
        { type: 'separator' },
        { id: 'file-save', label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('save') },
        {
          id: 'file-save-as',
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => send('save-as'),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          id: 'edit-undo',
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          registerAccelerator: false,
          click: () => send('undo'),
        },
        {
          id: 'edit-redo',
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          registerAccelerator: false,
          click: () => send('redo'),
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { id: 'view-reload', label: 'Reload', click: () => onReload() },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
    {
      label: 'Help',
      submenu: [
        {
          id: 'help-about',
          label: 'About Soroush Editor',
          click: () => showAboutDialog(BrowserWindow.getFocusedWindow()),
        },
      ],
    },
  ]
}

/** Builds and installs the application menu, forwarding item clicks to `send`. */
export function installApplicationMenu(
  send: (action: MenuAction) => void,
  onReload: () => void
): void {
  Menu.setApplicationMenu(Menu.buildFromTemplate(createMenuTemplate(send, onReload)))
}
