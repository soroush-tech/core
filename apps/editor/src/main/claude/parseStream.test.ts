import { createLineReader, parseStreamLine } from './parseStream'

const delta = (text: string) =>
  JSON.stringify({
    type: 'stream_event',
    event: { type: 'content_block_delta', delta: { type: 'text_delta', text } },
  })

describe('parseStreamLine', () => {
  it('reads the text of a content delta', () => {
    expect(parseStreamLine(delta('Hel'))).toEqual({ kind: 'delta', text: 'Hel' })
  })

  it('reads the whole answer from the terminal result line', () => {
    const line = JSON.stringify({
      type: 'result',
      subtype: 'success',
      result: 'Hello',
      is_error: false,
    })
    expect(parseStreamLine(line)).toEqual({ kind: 'result', text: 'Hello' })
  })

  it('reports a CLI failure carried in the result envelope', () => {
    const line = JSON.stringify({
      type: 'result',
      result: 'Credit balance too low',
      is_error: true,
    })
    expect(parseStreamLine(line)).toEqual({ kind: 'error', message: 'Credit balance too low' })
  })

  it('still reports an error when the failing result says nothing', () => {
    const line = JSON.stringify({ type: 'result', is_error: true })
    expect(parseStreamLine(line)).toEqual({
      kind: 'error',
      message: 'The Claude CLI reported an error',
    })
  })

  it('reports a result that is not text as an unexpected shape', () => {
    const line = JSON.stringify({ type: 'result', result: { text: 'Hello' } })
    expect(parseStreamLine(line)).toEqual({
      kind: 'error',
      message: 'Unexpected Claude CLI response shape',
    })
  })

  it.each([
    ['a message type it does not know', JSON.stringify({ type: 'system', subtype: 'init' })],
    ['an assistant message already seen as deltas', JSON.stringify({ type: 'assistant' })],
    ['a stream event that carries no text', JSON.stringify({ type: 'stream_event' })],
    [
      'a delta of another kind',
      JSON.stringify({ type: 'stream_event', event: { type: 'message_start' } }),
    ],
    ['a line that is not JSON', 'not json at all'],
    ['a line that is JSON but not an object', '42'],
    ['a line that is null', 'null'],
  ])('ignores %s rather than failing the run', (_name, line) => {
    expect(parseStreamLine(line)).toEqual({ kind: 'ignored' })
  })
})

describe('createLineReader', () => {
  it('holds a line back until its newline arrives', () => {
    const lines: string[] = []
    const reader = createLineReader((line) => lines.push(line))

    reader.push('{"a":')
    expect(lines).toEqual([])

    reader.push('1}\n')
    expect(lines).toEqual(['{"a":1}'])
  })

  it('reads several lines out of one chunk, skipping blank ones', () => {
    const lines: string[] = []
    const reader = createLineReader((line) => lines.push(line))

    reader.push('one\n\ntwo\n   \nthree\n')

    expect(lines).toEqual(['one', 'two', 'three'])
  })

  it('flushes a last line that never got its newline', () => {
    const lines: string[] = []
    const reader = createLineReader((line) => lines.push(line))

    reader.push('done')
    reader.end()

    expect(lines).toEqual(['done'])
  })

  it('has nothing to flush when the stream ended cleanly', () => {
    const lines: string[] = []
    const reader = createLineReader((line) => lines.push(line))

    reader.push('done\n')
    reader.end()
    reader.end()

    expect(lines).toEqual(['done'])
  })
})
