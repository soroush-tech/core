import { useCallback, useState } from 'react'

/**
 * One-shot "rewrite this selection" call to the local Claude Code CLI via the
 * preload bridge, with loading/error state for the panel UI.
 */
export function useClaudeEdit() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editSelection = useCallback(
    async (selectedText: string, instruction: string): Promise<string | null> => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await window.editorAPI.claude.editSelection(selectedText, instruction)
        if (!result.success) {
          setError(result.error)
          return null
        }
        return result.data
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { editSelection, isLoading, error }
}
