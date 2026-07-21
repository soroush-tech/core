import { describe, it, expect, vi, afterEach } from 'vitest'
import { BENCH_MARKER, upsertBenchComment } from './githubComment'
import { GITHUB_API } from 'src/services/githubApp'

const stubFetchSequence = (...responses: Response[]) => {
  const fetch = vi.fn()
  for (const response of responses) fetch.mockResolvedValueOnce(response)
  vi.stubGlobal('fetch', fetch)
  return fetch
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('upsertBenchComment', () => {
  it('updates the existing marker-matched comment in place', async () => {
    const listed = [
      { id: 1, body: 'unrelated' },
      { id: 2, body: `${BENCH_MARKER}\nold report` },
    ]
    const fetch = stubFetchSequence(
      new Response(JSON.stringify(listed)),
      new Response(JSON.stringify({ id: 2 }))
    )

    expect(await upsertBenchComment('tok', 'o', 'r', 5, `${BENCH_MARKER}\nnew`)).toBe(2)

    const [listUrl, listInit] = fetch.mock.calls[0] as [string, RequestInit]
    expect(listUrl).toBe(`${GITHUB_API}/repos/o/r/issues/5/comments?per_page=100`)
    expect((listInit.headers as Record<string, string>).authorization).toBe('Bearer tok')

    const [writeUrl, writeInit] = fetch.mock.calls[1] as [string, RequestInit]
    expect(writeUrl).toBe(`${GITHUB_API}/repos/o/r/issues/comments/2`)
    expect(writeInit.method).toBe('PATCH')
    expect(JSON.parse(writeInit.body as string)).toEqual({ body: `${BENCH_MARKER}\nnew` })
  })

  it('creates a new comment when none matches, ignoring body-less comments', async () => {
    const fetch = stubFetchSequence(
      new Response(JSON.stringify([{ id: 1 }])),
      new Response(JSON.stringify({ id: 9 }))
    )

    expect(await upsertBenchComment('tok', 'o', 'r', 5, `${BENCH_MARKER}\nnew`)).toBe(9)

    const [writeUrl, writeInit] = fetch.mock.calls[1] as [string, RequestInit]
    expect(writeUrl).toBe(`${GITHUB_API}/repos/o/r/issues/5/comments`)
    expect(writeInit.method).toBe('POST')
  })

  it('throws when the comment list fails', async () => {
    stubFetchSequence(new Response('', { status: 403 }))
    await expect(upsertBenchComment('tok', 'o', 'r', 5, BENCH_MARKER)).rejects.toThrow(
      'GitHub comment list failed (403)'
    )
  })

  it('throws when the comment write fails', async () => {
    stubFetchSequence(new Response(JSON.stringify([])), new Response('', { status: 502 }))
    await expect(upsertBenchComment('tok', 'o', 'r', 5, BENCH_MARKER)).rejects.toThrow(
      'GitHub comment write failed (502)'
    )
  })
})
