/**
 * What one line of the CLI's `--output-format stream-json` output meant. The
 * terminal `result` line carries the whole answer, so a run is never assembled
 * from deltas alone.
 */
export type StreamLine =
  | { kind: 'delta'; text: string }
  | { kind: 'result'; text: string }
  | { kind: 'error'; message: string }
  | { kind: 'ignored' }

interface ResultLine {
  type: 'result'
  subtype?: string
  result?: unknown
  is_error?: unknown
}

interface StreamEventLine {
  type: 'stream_event'
  event?: { type?: string; delta?: { type?: string; text?: unknown } }
}

/**
 * Reads one NDJSON line. Anything unrecognised — the `system` init line, an
 * `assistant` message already seen as deltas, a half-written line — is ignored
 * rather than failing the run: the CLI is free to add message types, and a run
 * that works today must not break when it does.
 */
export function parseStreamLine(line: string): StreamLine {
  let parsed: unknown
  try {
    parsed = JSON.parse(line)
  } catch {
    return { kind: 'ignored' }
  }
  if (typeof parsed !== 'object' || parsed === null) return { kind: 'ignored' }

  const message = parsed as StreamEventLine | ResultLine

  if (message.type === 'stream_event') {
    const { event } = message
    if (event?.type === 'content_block_delta' && typeof event.delta?.text === 'string') {
      return { kind: 'delta', text: event.delta.text }
    }
    return { kind: 'ignored' }
  }

  if (message.type === 'result') {
    const text = typeof message.result === 'string' ? message.result : ''
    // The CLI reports its own failures in the same envelope as a success.
    if (message.is_error === true) {
      return { kind: 'error', message: text || 'The Claude CLI reported an error' }
    }
    if (typeof message.result !== 'string') {
      return { kind: 'error', message: 'Unexpected Claude CLI response shape' }
    }
    return { kind: 'result', text }
  }

  return { kind: 'ignored' }
}

/**
 * Turns a stream of chunks into whole lines. A chunk boundary can fall
 * anywhere — mid-line, mid-multibyte-character — so the tail is held back
 * until its newline arrives.
 */
export function createLineReader(onLine: (line: string) => void) {
  let buffer = ''

  return {
    push(chunk: string): void {
      buffer += chunk
      const lastBreak = buffer.lastIndexOf('\n')
      // Nothing has been completed yet — it all belongs to the next chunk.
      if (lastBreak === -1) return

      const complete = buffer.slice(0, lastBreak)
      buffer = buffer.slice(lastBreak + 1)
      for (const line of complete.split('\n')) {
        if (line.trim() !== '') onLine(line)
      }
    },
    /** Flushes whatever arrived without a trailing newline, at end of stream. */
    end(): void {
      const rest = buffer
      buffer = ''
      if (rest.trim() !== '') onLine(rest)
    },
  }
}
