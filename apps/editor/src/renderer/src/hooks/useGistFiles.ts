import { useCallback, useEffect, useState } from 'react'
import type { GistContents, GistFile } from '../../../shared/ipc'

interface LoadedContents {
  gistId: string
  contents: GistContents
  error: string | null
}

const NO_FILES: GistFile[] = []

/**
 * One gist's published description and files. `gistId` of null means no gist
 * is selected yet.
 *
 * The result carries the gist it belongs to, so "loading" is derived from it
 * not matching the requested gist rather than set as its own state - switching
 * gists then shows the new gist's spinner, never the previous one's files.
 */
export function useGistFiles(gistId: string | null) {
  const [loaded, setLoaded] = useState<LoadedContents | null>(null)
  const [reloads, setReloads] = useState(0)

  useEffect(() => {
    if (gistId === null) return

    let isCurrent = true
    // The new-gist sandbox has nothing published, so main answers with an
    // empty gist rather than calling GitHub.
    void window.editorAPI.gists.files(gistId).then((result) => {
      // Switching gists mid-flight must not let the slower response win.
      if (!isCurrent) return
      setLoaded({
        gistId,
        contents: result.success ? result.data : { description: null, files: [] },
        error: result.success ? null : result.error,
      })
    })

    return () => {
      isCurrent = false
    }
  }, [gistId, reloads])

  const isFresh = loaded !== null && loaded.gistId === gistId
  return {
    files: isFresh ? loaded.contents.files : NO_FILES,
    /** The gist's published description - from the gist itself, not a list row. */
    description: isFresh ? loaded.contents.description : null,
    error: isFresh ? loaded.error : null,
    isLoading: gistId !== null && !isFresh,
    /** Refetches the current gist - after publishing, say. */
    reload: useCallback(() => setReloads((count) => count + 1), []),
  }
}
