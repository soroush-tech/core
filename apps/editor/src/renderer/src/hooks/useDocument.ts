import { useCallback, useEffect, useRef, useState } from 'react'

export interface DocumentState {
  content: string
  filePath: string | null
  isDirty: boolean
}

const EMPTY_DOCUMENT: DocumentState = { content: '', filePath: null, isDirty: false }

/**
 * Owns the current document: content, backing file path, and dirty state.
 * All disk access goes through `window.editorAPI.file`; the dirty flag is
 * mirrored to the main process so closing the window can prompt.
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
    void window.editorAPI.file.setDirty(document.isDirty)
  }, [document.isDirty])

  const change = useCallback((content: string) => {
    setError(null)
    setDocument((prev) => ({ ...prev, content, isDirty: true }))
  }, [])

  const confirmDiscardIfDirty = useCallback(async (): Promise<boolean> => {
    if (!documentRef.current.isDirty) return true
    const result = await window.editorAPI.file.confirmDiscard()
    return result.success && result.data
  }, [])

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
    setDocument({ ...result.data, isDirty: false })
  }, [confirmDiscardIfDirty])

  const save = useCallback(async (forceDialog = false) => {
    const { filePath, content } = documentRef.current
    const result = await window.editorAPI.file.save(forceDialog ? null : filePath, content)
    if (!result.success) return setError(result.error)
    if (result.data === null) return
    const savedPath = result.data.filePath
    setError(null)
    setDocument((prev) => ({ ...prev, filePath: savedPath, isDirty: false }))
  }, [])

  return { ...document, error, change, newDocument, open, save }
}
