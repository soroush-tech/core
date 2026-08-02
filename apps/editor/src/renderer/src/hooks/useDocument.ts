import { useCallback, useEffect, useRef, useState } from 'react'
import type { GistOrigin } from '../../../shared/ipc'

export interface DocumentState {
  content: string
  filePath: string | null
  /** Set when the document came from a gist file rather than from disk. */
  origin: GistOrigin | null
  isDirty: boolean
}

const EMPTY_DOCUMENT: DocumentState = {
  content: '',
  filePath: null,
  origin: null,
  isDirty: false,
}

/**
 * Owns the current document: content, backing file path or gist origin, and
 * dirty state. All disk access goes through `window.editorAPI.file`; the dirty
 * flag is mirrored to the main process so closing the window can prompt.
 */
export function useDocument() {
  const [document, setDocument] = useState<DocumentState>(EMPTY_DOCUMENT)
  const [error, setError] = useState<string | null>(null)

  // Actions read the latest state through a ref so they stay stable across renders.
  const documentRef = useRef(document)
  useEffect(() => {
    documentRef.current = document
  }, [document])

  useEffect(() => {
    void window.editorAPI.file.setDirty(document.isDirty, document.origin !== null)
  }, [document.isDirty, document.origin])

  const change = useCallback((content: string) => {
    setError(null)
    setDocument((prev) => ({ ...prev, content, isDirty: true }))
  }, [])

  /**
   * Saves the document where it belongs: a gist file is staged in that gist's
   * sandbox, anything else is written to disk. `forceDialog` is Save As, which
   * always means a file on disk.
   */
  const save = useCallback(async (forceDialog = false): Promise<boolean> => {
    const { filePath, origin, content } = documentRef.current

    if (origin && !forceDialog) {
      const staged = await window.editorAPI.gists.stage(origin.gistId, origin.filename, {
        status: 'modified',
        content,
      })
      if (!staged.success) {
        setError(staged.error)
        return false
      }
      setError(null)
      setDocument((prev) => ({ ...prev, isDirty: false }))
      return true
    }

    const result = await window.editorAPI.file.save(forceDialog ? null : filePath, content)
    if (!result.success) {
      setError(result.error)
      return false
    }
    // A cancelled Save As dialog is not a save, so the document stays dirty.
    if (result.data === null) return false
    const savedPath = result.data.filePath
    setError(null)
    setDocument((prev) => ({ ...prev, origin: null, filePath: savedPath, isDirty: false }))
    return true
  }, [])

  /**
   * Clears the way for a document about to be replaced: keep the work or throw
   * it away. Returns false only when the work could not be kept — a failed
   * prompt, or a save that did not happen — in which case the document stays.
   */
  const confirmDiscardIfDirty = useCallback(async (): Promise<boolean> => {
    if (!documentRef.current.isDirty) return true

    const result = await window.editorAPI.file.confirmDiscard()
    if (!result.success) return false
    if (result.data === 'discard') return true
    return save()
  }, [save])

  const newDocument = useCallback(async () => {
    if (!(await confirmDiscardIfDirty())) return
    setError(null)
    setDocument(EMPTY_DOCUMENT)
  }, [confirmDiscardIfDirty])

  const open = useCallback(async () => {
    if (!(await confirmDiscardIfDirty())) return
    const result = await window.editorAPI.file.open()
    if (!result.success) return setError(result.error)
    if (result.data === null) return
    setError(null)
    setDocument({ ...result.data, origin: null, isDirty: false })
  }, [confirmDiscardIfDirty])

  /**
   * Replaces the document with a gist file. `filePath` stays null and the
   * origin is remembered, so saving stages into that gist's sandbox rather
   * than writing to disk.
   */
  const load = useCallback(
    async (content: string, origin: GistOrigin): Promise<boolean> => {
      if (!(await confirmDiscardIfDirty())) return false
      setError(null)
      setDocument({ content, filePath: null, origin, isDirty: false })
      return true
    },
    [confirmDiscardIfDirty]
  )

  return { ...document, error, change, newDocument, open, load, save }
}
