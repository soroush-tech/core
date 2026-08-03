/** GitHub gist ids are hexadecimal — nothing else belongs in a gist URL. */
const GIST_ID = /^[0-9a-f]{5,64}$/i

/**
 * Whether this is a gist id and not something else on its way into a URL. The
 * ids reach main from the renderer, so they are checked here rather than
 * trusted: only what GitHub itself hands out is ever put in a request path.
 */
export function isGistId(id: string): boolean {
  return GIST_ID.test(id)
}

/** What every caller reports when the id fails that check. */
export const NOT_A_GIST_ID = 'That is not a gist id'
