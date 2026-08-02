/** How much of the text is shown before it is cut off. */
export const PREVIEW_LIMIT = 120

/**
 * A one-line taste of what Claude is about to work on. Markdown is full of
 * newlines and indentation, which would either break the line or leave the
 * preview mostly blank, so whitespace collapses to single spaces first.
 */
export function toPreview(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > PREVIEW_LIMIT ? `${flat.slice(0, PREVIEW_LIMIT)}…` : flat
}
