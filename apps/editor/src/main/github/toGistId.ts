/** GitHub gist ids are hexadecimal - nothing else belongs in a gist URL. */
const GIST_ID = /^[0-9a-f]{5,64}$/i

/**
 * The sandbox ids this app mints for a gist that does not exist yet: `new:` and
 * a UUID, plus the bare `new` that was the single shared sandbox before each
 * got its own. One of these never reaches a URL, but it is still a key in the
 * draft file, so it is checked by shape rather than by its prefix - which would
 * let anything at all through behind a `new:`.
 */
const NEW_GIST_ID = /^new(:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i

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

/**
 * The sandbox id, or null when what arrived only looks like one. Same rule as
 * above: what comes back is the text the pattern matched.
 */
export function toNewGistId(id: string): string | null {
  return NEW_GIST_ID.exec(id)?.[0] ?? null
}
