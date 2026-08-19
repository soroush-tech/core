import { useCallback, useEffect, useRef, useState } from 'react'
import type { GistDraft, GistDraftEntry } from '../../../shared/ipc'

const EMPTY: GistDraft = { files: {} }

interface LoadedDraft {
  gistId: string
  draft: GistDraft
}

/** How many staged changes the draft holds - the description counts as one. */
export function countChanges(draft: GistDraft): number {
  return Object.keys(draft.files).length + (draft.description === undefined ? 0 : 1)
}

/**
 * The local sandbox for one gist. Every change is staged through main, which
 * persists it, so nothing here reaches GitHub until `publish`.
 *
 * Like `useGistFiles`, the result carries the gist it belongs to and the
 * exposed draft is derived from that - switching gists never briefly shows the
 * previous gist's staged changes.
 */
export function useGistDraft(gistId: string | null) {
  const [loaded, setLoaded] = useState<LoadedDraft | null>(null)
  const [error, setError] = useState<string | null>(null)

  // IPC answers in whatever order it likes: a slow first read landing after a
  // quick stage would put the staged file back the way it was. Every request
  // takes a ticket, and only the newest one is allowed to speak for the draft -
  // to set it, or to report that it could not be changed. An overtaken request
  // that fails has been answered by the one that overtook it, and its error
  // describes a draft the panel is no longer showing.
  const issued = useRef(0)
  const claim = useCallback(() => {
    issued.current += 1
    return issued.current
  }, [])
  const isNewest = useCallback((ticket: number) => ticket === issued.current, [])

  useEffect(() => {
    if (gistId === null) return

    const ticket = claim()
    void window.editorAPI.gists.draft(gistId).then((result) => {
      if (!isNewest(ticket)) return
      setLoaded({ gistId, draft: result.success ? result.data : EMPTY })
    })
  }, [gistId, claim, isNewest])

  // Saving in the editor stages through main, not through this hook - without
  // this the panel would keep showing a stale change count.
  useEffect(
    () =>
      window.editorAPI.gists.onDraftChanged((change) => {
        // Another gist's draft changing says nothing about this one; adopting it
        // would leave the panel showing that gist's staged work under this id.
        if (change.gistId !== gistId) return
        setLoaded({ gistId: change.gistId, draft: change.draft })
      }),
    [gistId]
  )

  const stage = useCallback(
    async (id: string, filename: string, entry: GistDraftEntry | null) => {
      setError(null)
      const ticket = claim()
      const result = await window.editorAPI.gists.stage(id, filename, entry)
      if (!result.success) {
        if (isNewest(ticket)) setError(result.error)
        return false
      }
      if (isNewest(ticket)) setLoaded({ gistId: id, draft: result.data })
      return true
    },
    [claim, isNewest]
  )

  const renameFile = useCallback(
    async (id: string, from: string, to: string, content: string) => {
      setError(null)
      const ticket = claim()
      const result = await window.editorAPI.gists.renameFile(id, from, to, content)
      if (!result.success) {
        if (isNewest(ticket)) setError(result.error)
        return false
      }
      if (isNewest(ticket)) setLoaded({ gistId: id, draft: result.data })
      return true
    },
    [claim, isNewest]
  )

  const stageDescription = useCallback(
    async (id: string, description: string | null) => {
      setError(null)
      const ticket = claim()
      const result = await window.editorAPI.gists.stageDescription(id, description)
      if (!result.success) {
        if (isNewest(ticket)) setError(result.error)
        return false
      }
      if (isNewest(ticket)) setLoaded({ gistId: id, draft: result.data })
      return true
    },
    [claim, isNewest]
  )

  /** Resolves false when the draft still stands - a failure, or a cancelled prompt. */
  const reset = useCallback(
    async (id: string) => {
      setError(null)
      const ticket = claim()
      const result = await window.editorAPI.gists.reset(id)
      if (!result.success) {
        if (isNewest(ticket)) setError(result.error)
        return false
      }
      // `false` means the confirmation was cancelled - the draft stands.
      if (result.data && isNewest(ticket)) setLoaded({ gistId: id, draft: EMPTY })
      return result.data
    },
    [claim, isNewest]
  )

  /**
   * Resolves with the gist that now holds the work - the created one when a
   * sandbox was published - or null when nothing was published.
   */
  const publish = useCallback(
    async (id: string, isPublic = false): Promise<string | null> => {
      setError(null)
      const ticket = claim()
      const result = await window.editorAPI.gists.publish(id, isPublic)
      if (!result.success) {
        if (isNewest(ticket)) setError(result.error)
        return null
      }
      if (isNewest(ticket)) setLoaded({ gistId: id, draft: EMPTY })
      return result.data
    },
    [claim, isNewest]
  )

  const draft = loaded !== null && loaded.gistId === gistId ? loaded.draft : EMPTY
  return { draft, error, stage, renameFile, stageDescription, reset, publish }
}
