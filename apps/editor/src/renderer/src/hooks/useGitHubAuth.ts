import { useCallback, useEffect, useState } from 'react'
import type { GitHubStatus } from '../../../shared/ipc'

const SIGNED_OUT: GitHubStatus = { login: null, avatar: null }

/**
 * GitHub account state for the sidebar control. The token is passed straight
 * to main and never held here - only the account it resolves to comes back.
 */
export function useGitHubAuth() {
  const [account, setAccount] = useState<GitHubStatus>(SIGNED_OUT)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void window.editorAPI.github.status().then((result) => {
      if (result.success) setAccount(result.data)
    })
  }, [])

  const signIn = useCallback(async (token: string) => {
    setIsSaving(true)
    setError(null)
    try {
      const result = await window.editorAPI.github.signIn(token)
      if (result.success) setAccount(result.data)
      else setError(result.error)
      return result.success
    } finally {
      setIsSaving(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    const result = await window.editorAPI.github.signOut()
    if (result.success) setAccount(SIGNED_OUT)
    else setError(result.error)
  }, [])

  const openTokenSettings = useCallback(async () => {
    const result = await window.editorAPI.github.openTokenSettings()
    if (!result.success) setError(result.error)
  }, [])

  return {
    login: account.login,
    avatar: account.avatar,
    error,
    isSaving,
    signIn,
    signOut,
    openTokenSettings,
  }
}
