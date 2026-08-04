/** GitHub gist ids are hexadecimal — nothing else belongs in a gist URL. */
const GIST_ID = /^[0-9a-f]{5,64}$/i

/** What every caller reports when the id fails that check. */
export const NOT_A_GIST_ID = 'That is not a gist id'

/**
 * The gist id, or null when what arrived is something else on its way into a
 * URL. Ids reach main from the renderer, so they are checked here rather than
 * trusted.
 *
 * What comes back is the text the pattern matched rather than the string that
 * went in, so the value put into a request path is one this file produced.
 */
export function toGistId(id: string): string | null {
  return GIST_ID.exec(id)?.[0] ?? null
}
