import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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

  // Counts wholesale replacements, so work started against one document can
  // tell that another has taken its place - two documents can hold the same
  // text, which is what an empty one and a new one always do. Editing and
  // saving stay on the same document, so neither moves it on.
  //
  // A ref, advanced as the replacement is made rather than through state: a
  // replacement schedules its state and returns, so an answer arriving in
  // between would still read the document it replaced.
  const revision = useRef(0)

  // Counts renames of the open gist file. The document is the same one, so this
  // is not a replacement - but a save that staged under the old name did not
  // stage what the file is now called.
  const originName = useRef(0)

  // Actions read the latest state through a ref so they stay stable across
  // renders. Assigned in a layout effect: a passive one runs after paint, and a
  // save fired in between would write the content as it was a render ago.
  const documentRef = useRef(document)
  useLayoutEffect(() => {
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
    // The document this save is about, and the name it went by. Either can
    // change while the write is in flight, and what comes back says nothing
    // about what took its place - marking that clean, or handing it this one's
    // path, would be a lie. A rename is the same document under another name,
    // so it moves the name and not the document.
    const saved = revision.current
    const savedAs = originName.current

    if (origin && !forceDialog) {
      const staged = await window.editorAPI.gists.stage(origin.gistId, origin.filename, {
        status: 'modified',
        content,
      })
      // Staged under a name the file has since been renamed away from: what
      // reached the sandbox is not what the document is called any more.
      if (revision.current !== saved || originName.current !== savedAs) return false
      if (!staged.success) {
        setError(staged.error)
        return false
      }
      setError(null)
      // Typing during the save leaves newer content than was written, and
      // calling that clean would hide it from the Save button and the close prompt.
      setDocument((prev) => (prev.content === content ? { ...prev, isDirty: false } : prev))
      return true
    }

    // Save As opens on the name the document already goes by: its path on disk,
    // or the gist file it came from.
    const result = await window.editorAPI.file.save(
      forceDialog ? null : filePath,
      content,
      filePath ?? origin?.filename ?? null
    )
    if (revision.current !== saved) return false
    if (!result.success) {
      setError(result.error)
      return false
    }
    // A cancelled Save As dialog is not a save, so the document stays dirty.
    if (result.data === null) return false
    const savedPath = result.data.filePath
    setError(null)
    setDocument((prev) => ({
      ...prev,
      origin: null,
      filePath: savedPath,
      // Same as above: what reached disk is what `content` held when the save began.
      isDirty: prev.content !== content,
    }))
    return true
  }, [])

  /**
   * Clears the way for a document about to be replaced: keep the work or throw
   * it away. Returns false only when the work could not be kept - a failed
   * prompt, or a save that did not happen - in which case the document stays.
   */
  const confirmDiscardIfDirty = useCallback(async (): Promise<boolean> => {
    if (!documentRef.current.isDirty) return true

    const result = await window.editorAPI.file.confirmDiscard()
    if (!result.success) return false
    if (result.data === 'discard') return true
    return save()
  }, [save])

  /**
   * Follows a gist file renamed under the editor, so a later save stages the
   * content under the name the file now has rather than resurrecting the old one.
   */
  const renameOrigin = useCallback((gistId: string, from: string, to: string) => {
    if (
      documentRef.current.origin?.gistId !== gistId ||
      documentRef.current.origin.filename !== from
    ) {
      return
    }
    originName.current += 1
    setDocument((prev) => ({ ...prev, origin: { gistId, filename: to } }))
  }, [])

  /**
   * Follows the sandbox to the gist that publishing created. The same document
   * under a new address, so a later save stages against the gist that exists
   * rather than resurrecting a draft for the sandbox that has just gone.
   */
  const followPublished = useCallback((from: string, to: string) => {
    const { origin } = documentRef.current
    if (origin?.gistId !== from) return
    // As with a rename: a save still in flight staged where this document no
    // longer is, and what comes back says nothing about where it went.
    originName.current += 1
    setDocument((prev) => ({ ...prev, origin: { gistId: to, filename: origin.filename } }))
  }, [])

  const newDocument = useCallback(async () => {
    if (!(await confirmDiscardIfDirty())) return
    setError(null)
    revision.current += 1
    setDocument(EMPTY_DOCUMENT)
  }, [confirmDiscardIfDirty])

  const open = useCallback(async () => {
    if (!(await confirmDiscardIfDirty())) return
    const result = await window.editorAPI.file.open()
    if (!result.success) return setError(result.error)
    if (result.data === null) return
    setError(null)
    revision.current += 1
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
      revision.current += 1
      setDocument({ content, filePath: null, origin, isDirty: false })
      return true
    },
    [confirmDiscardIfDirty]
  )

  return {
    ...document,
    revision,
    error,
    change,
    newDocument,
    open,
    load,
    save,
    renameOrigin,
    followPublished,
  }
}
