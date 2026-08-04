import { useCallback, useEffect, useState } from 'react'
import type { GistFile } from '../../../shared/ipc'

interface LoadedFiles {
  gistId: string
  files: GistFile[]
  error: string | null
}

/**
 * The files of one gist. `gistId` of null means no gist is selected yet.
 *
 * The result carries the gist it belongs to, so "loading" is derived from it
 * not matching the requested gist rather than set as its own state — switching
 * gists then shows the new gist's spinner, never the previous one's files.
 */
export function useGistFiles(gistId: string | null) {
  const [loaded, setLoaded] = useState<LoadedFiles | null>(null)
  const [reloads, setReloads] = useState(0)

  useEffect(() => {
    if (gistId === null) return

    let isCurrent = true
    void window.editorAPI.gists.files(gistId).then((result) => {
      // Switching gists mid-flight must not let the slower response win.
      if (!isCurrent) return
      setLoaded({
        gistId,
        files: result.success ? result.data : [],
        error: result.success ? null : result.error,
      })
    })

    return () => {
      isCurrent = false
    }
  }, [gistId, reloads])

  const isFresh = loaded !== null && loaded.gistId === gistId
  return {
    files: isFresh ? loaded.files : [],
    error: isFresh ? loaded.error : null,
    isLoading: gistId !== null && !isFresh,
    /** Refetches the current gist — after adding a file, say. */
    reload: useCallback(() => setReloads((count) => count + 1), []),
  }
}
