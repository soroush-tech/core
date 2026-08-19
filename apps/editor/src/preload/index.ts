import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import {
  CLAUDE_CHANNELS,
  FILE_CHANNELS,
  GIST_CHANNELS,
  GITHUB_CHANNELS,
  MENU_CHANNELS,
  type ClaudeEvent,
  type GistDraft,
  type GistDraftChange,
  type GistDraftEntry,
  type GistContents,
  type GistDrafts,
  type GistSummary,
  type GitHubStatus,
  type MenuAction,
  type OpenedFile,
  type Result,
  type SavedFile,
  type UnsavedChoice,
} from '../shared/ipc'

const editorAPI = {
  claude: {
    /**
     * Starts a run and resolves its id; the text arrives through `onEvent`.
     * `context` is background material - an existing gist to build on.
     */
    startEdit: (
      selectedText: string,
      instruction: string,
      context: string | null = null
    ): Promise<Result<string>> =>
      ipcRenderer.invoke(CLAUDE_CHANNELS.startEdit, selectedText, instruction, context),
    /** Stops a run in flight. Nothing is applied to the document. */
    cancel: (runId: string): Promise<Result<null>> =>
      ipcRenderer.invoke(CLAUDE_CHANNELS.cancel, runId),
    /** Subscribes to run events; returns an unsubscribe. */
    onEvent: (callback: (event: ClaudeEvent) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, claudeEvent: ClaudeEvent) => callback(claudeEvent)
      ipcRenderer.on(CLAUDE_CHANNELS.event, handler)
      return () => {
        ipcRenderer.removeListener(CLAUDE_CHANNELS.event, handler)
      }
    },
  },
  gists: {
    /** The signed-in account's gists, newest first. */
    list: (): Promise<Result<GistSummary[]>> => ipcRenderer.invoke(GIST_CHANNELS.list),
    /** Every file in one gist, with content. */
    files: (id: string): Promise<Result<GistContents>> =>
      ipcRenderer.invoke(GIST_CHANNELS.files, id),
    /** Every gist with unpublished changes, by id. */
    drafts: (): Promise<Result<GistDrafts>> => ipcRenderer.invoke(GIST_CHANNELS.drafts),
    /** Everything staged locally for this gist, by filename. */
    draft: (id: string): Promise<Result<GistDraft>> => ipcRenderer.invoke(GIST_CHANNELS.draft, id),
    /** Stages one change locally, or clears it with `entry: null`. Nothing is sent to GitHub. */
    stage: (
      id: string,
      filename: string,
      entry: GistDraftEntry | null
    ): Promise<Result<GistDraft>> => ipcRenderer.invoke(GIST_CHANNELS.stage, id, filename, entry),
    /** Renames a file as one change, so it cannot come apart halfway. */
    renameFile: (
      id: string,
      from: string,
      to: string,
      content: string
    ): Promise<Result<GistDraft>> =>
      ipcRenderer.invoke(GIST_CHANNELS.renameFile, id, from, to, content),
    /** Stages the gist's description, or clears the staged one with `null`. */
    stageDescription: (id: string, description: string | null): Promise<Result<GistDraft>> =>
      ipcRenderer.invoke(GIST_CHANNELS.stageDescription, id, description),
    /** Discards the draft after a confirmation prompt. Resolves `false` if cancelled. */
    reset: (id: string): Promise<Result<boolean>> => ipcRenderer.invoke(GIST_CHANNELS.reset, id),
    /**
     * Sends the whole draft to GitHub in one request, then clears it. For the
     * new-gist sandbox this creates the gist - `isPublic` decides its
     * visibility and is ignored for one that already exists.
     */
    publish: (id: string, isPublic: boolean): Promise<Result<string>> =>
      ipcRenderer.invoke(GIST_CHANNELS.publish, id, isPublic),
    /** Subscribes to draft changes made anywhere in the app; returns an unsubscribe. */
    onDraftChanged: (callback: (change: GistDraftChange) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, change: GistDraftChange) => callback(change)
      ipcRenderer.on(GIST_CHANNELS.draftChanged, handler)
      return () => {
        ipcRenderer.removeListener(GIST_CHANNELS.draftChanged, handler)
      }
    },
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
    /**
     * Pass `filePath: null` to force a Save As dialog. Cancelled dialog resolves
     * `data: null`. `suggested` is what that dialog opens on - the name the
     * document already goes by, so it need not be typed again.
     */
    save: (
      filePath: string | null,
      content: string,
      suggested: string | null = null
    ): Promise<Result<SavedFile | null>> =>
      ipcRenderer.invoke(FILE_CHANNELS.save, filePath, content, suggested),
    /** `isDraft` lets the close prompt offer "Save as draft" for a gist file. */
    setDirty: (isDirty: boolean, isDraft: boolean): Promise<Result<null>> =>
      ipcRenderer.invoke(FILE_CHANNELS.setDirty, isDirty, isDraft),
    /** Asks what to do about unsaved changes: save, discard, or cancel. */
    confirmDiscard: (): Promise<Result<UnsavedChoice>> =>
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
