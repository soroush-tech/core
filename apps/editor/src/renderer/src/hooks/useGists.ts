import { useEffect, useState } from 'react'
import type { GistSummary } from '../../../shared/ipc'

/**
 * The account's gists, fetched once on mount — the panel only mounts this
 * while its row is selected, so opening the panel is the refresh.
 */
export function useGists() {
  const [gists, setGists] = useState<GistSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void window.editorAPI.gists.list().then((result) => {
      if (result.success) setGists(result.data)
      else setError(result.error)
      setIsLoading(false)
    })
  }, [])

  return { gists, error, isLoading }
}
