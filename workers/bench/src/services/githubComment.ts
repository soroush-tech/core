import { API_HEADERS, GITHUB_API } from 'src/services/githubApp'

/**
 * Hidden marker identifying the action's sticky PR comment. Mirrors `COMMENT_MARKER` in
 * soroush-tech/bench-action `src/comment.ts` — the two repos share no code.
 */
export const BENCH_MARKER = '<!-- soroush-bench-action -->'

/**
 * Creates or updates the marker-matched report comment on the PR using an installation token,
 * so the comment is authored by the bench bot. Only bot-authored comments are matched — a PR
 * participant pasting the marker into their own comment must not capture the report — while
 * still converging with the action's own `github-actions[bot]` fallback comment. Returns the
 * comment id; throws on any non-2xx.
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
  const existing = comments.find(
    (comment) => comment.user?.type === 'Bot' && comment.body?.includes(BENCH_MARKER) === true
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
