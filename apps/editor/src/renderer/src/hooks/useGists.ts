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
    window.editorAPI.gists
      .list()
      .then((result) => {
        if (result.success) setGists(result.data)
        else setError(result.error)
      })
      // An IPC call that rejects outright would otherwise leave the panel
      // spinning for ever with nothing said.
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : String(reason))
      )
      .finally(() => setIsLoading(false))
  }, [])

  return { gists, error, isLoading }
}
