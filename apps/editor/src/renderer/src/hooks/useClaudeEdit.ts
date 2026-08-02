import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClaudeEvent } from '../../../shared/ipc'

export interface UseClaudeEditOptions {
  /**
   * Called with everything written so far, each time more arrives — so the
   * document can show the answer taking shape rather than appearing at the end.
   */
  onText: (text: string) => void
}

/**
 * One streaming "rewrite this" run against the local Claude Code CLI. The text
 * arrives in deltas, but `editSelection` resolves with the run's own result — a
 * dropped delta must never corrupt what is finally kept.
 *
 * A cancelled run resolves to null and reports nothing: stopping it was the point.
 */
export function useClaudeEdit({ onText }: UseClaudeEditOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // What has arrived so far, and the caller's current callback. Refs, because
  // the listener is subscribed once and must not be torn down mid-run.
  const streamed = useRef('')
  const report = useRef(onText)
  useEffect(() => {
    report.current = onText
  })

  // The run in flight and whoever awaits it. Refs rather than state: the
  // listener is subscribed once and must always see the current run.
  const runId = useRef<string | null>(null)
  const settle = useRef<((text: string | null) => void) | null>(null)

  const finish = useCallback((text: string | null) => {
    runId.current = null
    setIsLoading(false)
    settle.current?.(text)
    settle.current = null
  }, [])

  useEffect(
    () =>
      window.editorAPI.claude.onEvent((event: ClaudeEvent) => {
        // Events for a run this hook is not waiting on are not its business.
        if (event.runId !== runId.current) return

        if (event.type === 'TEXT_MESSAGE_CONTENT') {
          streamed.current += event.delta
          return report.current(streamed.current)
        }
        if (event.type === 'RUN_FINISHED') return finish(event.text)
        if (event.type === 'RUN_ERROR') {
          setError(event.error)
          finish(null)
        }
      }),
    [finish]
  )

  const editSelection = useCallback(
    async (
      selectedText: string,
      instruction: string,
      context: string | null = null
    ): Promise<string | null> => {
      setIsLoading(true)
      setError(null)
      streamed.current = ''

      const started = await window.editorAPI.claude.startEdit(selectedText, instruction, context)
      if (!started.success) {
        setError(started.error)
        setIsLoading(false)
        return null
      }

      runId.current = started.data
      return new Promise<string | null>((resolve) => {
        settle.current = resolve
      })
    },
    []
  )

  const cancel = useCallback(async () => {
    const current = runId.current
    if (current === null) return
    await window.editorAPI.claude.cancel(current)
    finish(null)
  }, [finish])

  return { editSelection, cancel, isLoading, error }
}
