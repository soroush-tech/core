import { useCallback, useState } from 'react'

/** How long the "copied" confirmation stays true before reverting, in ms. */
export const COPIED_RESET_MS = 2000

export interface UseCopyToClipboardResult {
  /** `true` for `resetMs` after a successful copy, then back to `false`. */
  copied: boolean
  /** Copy `text` to the clipboard; a no-op in insecure/unsupported contexts. */
  copy: (text: string) => void
}

/**
 * Copy-to-clipboard with a transient `copied` flag. Guards the unavailable
 * clipboard API and rejected writes so the caller never throws or gets stuck.
 */
export function useCopyToClipboard(resetMs: number = COPIED_RESET_MS): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    (text: string) => {
      // Clipboard is unavailable in insecure/unsupported contexts, and writeText can
      // reject (e.g. permission denied) — guard both so the UI never sticks.
      if (!navigator.clipboard?.writeText) return
      void navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), resetMs)
        })
        .catch(() => {
          // Clipboard write failed; leave `copied` in its idle state.
        })
    },
    [resetMs]
  )

  return { copied, copy }
}
