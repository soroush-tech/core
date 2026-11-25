import { API_HEADERS, GITHUB_API } from 'src/services/githubApp'

/**
 * Hidden marker identifying the action's sticky PR comment. Mirrors `COMMENT_MARKER` in
 * soroush-tech/bench-action `src/comment.ts` - the two repos share no code.
 */
export const BENCH_MARKER = '<!-- soroush-bench-action -->'

/**
 * What a report body must open with: a first line holding the plain marker, or the marker keyed
 * by the job's comment id (`<!-- soroush-bench-action:browser -->`), so several bench jobs on
 * one PR each keep their own comment.
 */
export const MARKER_LINE = /^<!-- soroush-bench-action(?::[a-z0-9-]{1,64})? -->(?:\r?\n|$)/

/** A body's first line - the key its sticky comment is found by. */
export const markerLine = (body: string): string => body.split(/\r?\n/, 1)[0]

/**
 * Creates or updates the report comment on the PR using an installation token, so the comment
 * is authored by the bench bot. The comment to update is the one starting with the same marker
 * line, so a keyed report never takes over another job's comment. Only bot-authored comments are
 * matched - a PR participant pasting the marker into their own comment must not capture the
 * report - while still converging with the action's own `github-actions[bot]` fallback comment.
 * Returns the comment id; throws on any non-2xx.
 */
export const upsertBenchComment = async (
  installationToken: string,
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<number> => {
  const headers = {
    ...API_HEADERS,
    authorization: `Bearer ${installationToken}`,
    'content-type': 'application/json',
  }
  const issues = `${GITHUB_API}/repos/${owner}/${repo}/issues`

  const listed = await fetch(`${issues}/${prNumber}/comments?per_page=100`, { headers })
  if (!listed.ok) throw new Error(`GitHub comment list failed (${listed.status})`)
  const comments = (await listed.json()) as {
    id: number
    body?: string
    user?: { type?: string }
  }[]
  const key = markerLine(body)
  const existing = comments.find(
    (comment) =>
      comment.user?.type === 'Bot' && comment.body !== undefined && markerLine(comment.body) === key
  )

  const written = existing
    ? await fetch(`${issues}/comments/${existing.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ body }),
      })
    : await fetch(`${issues}/${prNumber}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body }),
      })
  if (!written.ok) throw new Error(`GitHub comment write failed (${written.status})`)
  const { id } = (await written.json()) as { id: number }
  return id
}
