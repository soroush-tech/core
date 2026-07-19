import { contextBridge, ipcRenderer } from 'electron'
import { FILE_CHANNELS, type OpenedFile, type Result, type SavedFile } from '../shared/ipc'

const editorAPI = {
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
}

export type EditorAPI = typeof editorAPI

contextBridge.exposeInMainWorld('editorAPI', editorAPI)
