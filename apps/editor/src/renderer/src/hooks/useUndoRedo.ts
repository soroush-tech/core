import { useCallback, useEffect, useRef, useState } from 'react'

const COMMIT_DELAY_MS = 500

export interface UndoRedo {
  undo: () => void
  redo: () => void
  /** Clears the history — call when a different document is loaded. */
  reset: () => void
  canUndo: boolean
  canRedo: boolean
}

/**
 * Snapshot history over a controlled string value. Rapid edits coalesce into a
 * single undo step: a snapshot is committed only once the value has been stable
 * for half a second (or immediately when undo/redo needs it). Binds
 * Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, and Ctrl/Cmd+Y globally.
 */
export function useUndoRedo(value: string, onChange: (value: string) => void): UndoRedo {
  const pastRef = useRef<string[]>([])
  const futureRef = useRef<string[]>([])
  // Last committed snapshot; the gap between it and `value` is the pending edit.
  const stableRef = useRef(value)
  const valueRef = useRef(value)
  const timerRef = useRef<number | undefined>(undefined)
  const onChangeRef = useRef(onChange)
  const [flags, setFlags] = useState({ canUndo: false, canRedo: false })

  useEffect(() => {
    valueRef.current = value
    onChangeRef.current = onChange
  }, [value, onChange])

  const syncFlags = useCallback(() => {
    setFlags({ canUndo: pastRef.current.length > 0, canRedo: futureRef.current.length > 0 })
  }, [])

  // Commits the pending edit (if any) as an undo step and drops the redo stack.
  const flushPending = useCallback(() => {
    window.clearTimeout(timerRef.current)
    if (valueRef.current === stableRef.current) return
    pastRef.current.push(stableRef.current)
    stableRef.current = valueRef.current
    futureRef.current = []
  }, [])

  useEffect(() => {
    if (value === stableRef.current) return
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      pastRef.current.push(stableRef.current)
      stableRef.current = value
      futureRef.current = []
      syncFlags()
    }, COMMIT_DELAY_MS)
    return () => window.clearTimeout(timerRef.current)
  }, [value, syncFlags])

  const undo = useCallback(() => {
    flushPending()
    const previous = pastRef.current.pop()
    if (previous === undefined) return syncFlags()
    futureRef.current.push(stableRef.current)
    stableRef.current = previous
    onChangeRef.current(previous)
    syncFlags()
  }, [flushPending, syncFlags])

  const redo = useCallback(() => {
    flushPending()
    const next = futureRef.current.pop()
    if (next === undefined) return syncFlags()
    pastRef.current.push(stableRef.current)
    stableRef.current = next
    onChangeRef.current(next)
    syncFlags()
  }, [flushPending, syncFlags])

  const reset = useCallback(() => {
    window.clearTimeout(timerRef.current)
    pastRef.current = []
    futureRef.current = []
    stableRef.current = valueRef.current
    syncFlags()
  }, [syncFlags])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      const key = event.key.toLowerCase()
      if (key !== 'z' && key !== 'y') return
      event.preventDefault()
      if (key === 'y' || event.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  return { undo, redo, reset, ...flags }
}
