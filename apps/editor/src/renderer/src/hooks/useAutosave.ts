import { useEffect } from 'react'

/** How long unsaved typing may sit before it is written to the draft. */
export const AUTOSAVE_INTERVAL_MS = 2000

/**
 * Saves a dirty gist document into its sandbox draft on its own, at most once
 * every couple of seconds. Only gist documents: they have a draft to save
 * into, and staging there is invisible - no dialog, nothing written over a
 * file of the user's. A crash or reload then costs at most the last two
 * seconds of typing instead of the whole article.
 *
 * An interval rather than a timeout: typing during a save keeps the document
 * dirty without changing any dependency, so a one-shot timer would never be
 * rescheduled and the tail of the typing would sit unsaved indefinitely.
 */
export function useAutosave(
  hasDraftHome: boolean,
  isDirty: boolean,
  save: () => Promise<boolean>
): void {
  useEffect(() => {
    if (!hasDraftHome || !isDirty) return
    const timer = setInterval(() => void save(), AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [hasDraftHome, isDirty, save])
}
