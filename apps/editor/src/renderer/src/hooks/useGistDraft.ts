import { useCallback, useEffect, useState } from 'react'
import type { GistDraft, GistDraftEntry } from '../../../shared/ipc'

const EMPTY: GistDraft = { files: {} }

interface LoadedDraft {
  gistId: string
  draft: GistDraft
}

/** How many staged changes the draft holds — the description counts as one. */
export function countChanges(draft: GistDraft): number {
  return Object.keys(draft.files).length + (draft.description === undefined ? 0 : 1)
}

/**
 * The local sandbox for one gist. Every change is staged through main, which
 * persists it, so nothing here reaches GitHub until `publish`.
 *
 * Like `useGistFiles`, the result carries the gist it belongs to and the
 * exposed draft is derived from that — switching gists never briefly shows the
 * previous gist's staged changes.
 */
export function useGistDraft(gistId: string | null) {
  const [loaded, setLoaded] = useState<LoadedDraft | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (gistId === null) return

    let isCurrent = true
    void window.editorAPI.gists.draft(gistId).then((result) => {
      if (!isCurrent) return
      setLoaded({ gistId, draft: result.success ? result.data : EMPTY })
    })

    return () => {
      isCurrent = false
    }
  }, [gistId])

  // Saving in the editor stages through main, not through this hook — without
  // this the panel would keep showing a stale change count.
  useEffect(
    () =>
      window.editorAPI.gists.onDraftChanged((change) => {
        setLoaded({ gistId: change.gistId, draft: change.draft })
      }),
    []
  )

  const stage = useCallback(async (id: string, filename: string, entry: GistDraftEntry | null) => {
    setError(null)
    const result = await window.editorAPI.gists.stage(id, filename, entry)
    if (result.success) setLoaded({ gistId: id, draft: result.data })
    else setError(result.error)
    return result.success
  }, [])

  const stageDescription = useCallback(async (id: string, description: string | null) => {
    setError(null)
    const result = await window.editorAPI.gists.stageDescription(id, description)
    if (result.success) setLoaded({ gistId: id, draft: result.data })
    else setError(result.error)
    return result.success
  }, [])

  const reset = useCallback(async (id: string) => {
    setError(null)
    const result = await window.editorAPI.gists.reset(id)
    if (!result.success) return setError(result.error)
    // `false` means the confirmation was cancelled — the draft stands.
    if (result.data) setLoaded({ gistId: id, draft: EMPTY })
  }, [])

  const publish = useCallback(async (id: string) => {
    setError(null)
    const result = await window.editorAPI.gists.publish(id)
    if (!result.success) return setError(result.error)
    setLoaded({ gistId: id, draft: EMPTY })
  }, [])

  const draft = loaded !== null && loaded.gistId === gistId ? loaded.draft : EMPTY
  return { draft, error, stage, stageDescription, reset, publish }
}
