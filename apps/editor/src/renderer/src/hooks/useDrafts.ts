import { useCallback, useEffect, useRef, useState } from 'react'
import type { GistDrafts } from '../../../shared/ipc'
import { countChanges } from './useGistDraft'

const EMPTY: GistDrafts = {}

/**
 * Every gist with unpublished changes — the way back to work left unfinished
 * when the panel moved on to another gist.
 *
 * Kept in step through the same announcement the panel and the editor use, so
 * saving in one place updates the list without refetching it.
 */
export function useDrafts() {
  const [drafts, setDrafts] = useState<GistDrafts>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Gists an announcement has already spoken for. The subscription below is live
  // from the same commit as the fetch, so one can arrive first — and what it said
  // is newer than the snapshot, including that a published gist has nothing left.
  const announced = useRef(new Set<string>())

  useEffect(() => {
    void window.editorAPI.gists.drafts().then((result) => {
      if (result.success) {
        setDrafts((current) => {
          const older = Object.entries(result.data).filter(([id]) => !announced.current.has(id))
          return { ...Object.fromEntries(older), ...current }
        })
      } else setError(result.error)
      setIsLoading(false)
    })
  }, [])

  useEffect(
    () =>
      window.editorAPI.gists.onDraftChanged(({ gistId, draft }) => {
        announced.current.add(gistId)
        setDrafts((previous) => {
          const next = { ...previous }
          // A published or reset gist has nothing left to come back to.
          if (countChanges(draft) === 0) delete next[gistId]
          else next[gistId] = draft
          return next
        })
      }),
    []
  )

  /**
   * Throws one gist's draft away. Main confirms it first, and announces the
   * result — so a confirmed discard removes the row and a cancelled one
   * leaves it exactly where it was.
   */
  const discard = useCallback(async (gistId: string) => {
    setError(null)
    const result = await window.editorAPI.gists.reset(gistId)
    if (!result.success) setError(result.error)
  }, [])

  return { drafts, error, isLoading, discard }
}
