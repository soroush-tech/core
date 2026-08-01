import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import {
  CLAUDE_CHANNELS,
  FILE_CHANNELS,
  GITHUB_CHANNELS,
  MENU_CHANNELS,
  type GitHubStatus,
  type MenuAction,
  type OpenedFile,
  type Result,
  type SavedFile,
} from '../shared/ipc'

const editorAPI = {
  claude: {
    editSelection: (selectedText: string, instruction: string): Promise<Result<string>> =>
      ipcRenderer.invoke(CLAUDE_CHANNELS.editSelection, selectedText, instruction),
  },
  github: {
    status: (): Promise<Result<GitHubStatus>> => ipcRenderer.invoke(GITHUB_CHANNELS.status),
    /** Checks the token against GitHub and stores it when it holds up. */
    signIn: (token: string): Promise<Result<GitHubStatus>> =>
      ipcRenderer.invoke(GITHUB_CHANNELS.signIn, token),
    signOut: (): Promise<Result<null>> => ipcRenderer.invoke(GITHUB_CHANNELS.signOut),
    /** Opens GitHub's token page in the user's browser. Takes no URL by design. */
    openTokenSettings: (): Promise<Result<null>> =>
      ipcRenderer.invoke(GITHUB_CHANNELS.openTokenSettings),
  },
  file: {
    open: (): Promise<Result<OpenedFile | null>> => ipcRenderer.invoke(FILE_CHANNELS.open),
    /** Pass `filePath: null` to force a Save As dialog. Cancelled dialog resolves `data: null`. */
    save: (filePath: string | null, content: string): Promise<Result<SavedFile | null>> =>
      ipcRenderer.invoke(FILE_CHANNELS.save, filePath, content),
    setDirty: (isDirty: boolean): Promise<Result<null>> =>
      ipcRenderer.invoke(FILE_CHANNELS.setDirty, isDirty),
    confirmDiscard: (): Promise<Result<boolean>> =>
      ipcRenderer.invoke(FILE_CHANNELS.confirmDiscard),
  },
  menu: {
    /** Subscribes to application-menu actions; returns an unsubscribe. */
    onAction: (callback: (action: MenuAction) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, action: MenuAction) => callback(action)
      ipcRenderer.on(MENU_CHANNELS.action, handler)
      return () => {
        ipcRenderer.removeListener(MENU_CHANNELS.action, handler)
      }
    },
  },
}

export type EditorAPI = typeof editorAPI

contextBridge.exposeInMainWorld('editorAPI', editorAPI)
