export interface MarkdownBlock {
  /** The block's markdown source, without surrounding blank lines. */
  source: string
  /** Character offset of `source` within the full document. */
  start: number
  /** Offset just past the last character of `source` (exclusive). */
  end: number
}

// Up to three characters of indentation, then a run of at least three backticks
// or tildes. Deliberately narrow: `[ \t]` rather than `\s`, which would also
// admit the newline that cannot occur mid-line, and nothing trailing the run —
// an unbounded `(.*)` after an unbounded marker gives the engine an ambiguous
// split to backtrack through. What follows the marker is sliced off instead.
const FENCE = /^[ \t]{0,3}(`{3,}|~{3,})/

/**
 * The fence state after `line`: unchanged when the line carries no marker, the
 * marker itself when one opens a block, and `null` when one closes it.
 *
 * A closing marker must use the same character, be at least as long, and carry
 * nothing after it. The info string is what separates the two roles — a
 * ```` ```ts ```` line inside an open ```` ``` ```` block opens nothing and closes
 * nothing, it is content. Without that check the block would end early and its
 * remaining blank lines would split it into further blocks.
 */
const nextFence = (line: string, fence: string | null): string | null => {
  const match = FENCE.exec(line)
  if (!match) return fence
  const [matched, marker] = match
  if (fence === null) return marker
  const info = line.slice(matched.length)
  const closes = info.trim() === '' && marker.startsWith(fence[0]) && marker.length >= fence.length
  return closes ? null : fence
}

/**
 * Splits markdown into top-level blocks separated by blank lines, keeping
 * fenced code blocks whole — blank lines inside a ``` / ~~~ fence never split.
 * Offsets index the original string, so an edited block's source can be
 * spliced back losslessly.
 */
export function splitBlocks(value: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  let blockStart = -1
  let blockEnd = -1
  let fence: string | null = null
  let offset = 0

  for (const line of value.split('\n')) {
    const isBlank = line.trim() === ''
    if (blockStart >= 0 && isBlank && fence === null) {
      blocks.push({ source: value.slice(blockStart, blockEnd), start: blockStart, end: blockEnd })
      blockStart = -1
    } else if (!isBlank || fence !== null) {
      if (blockStart < 0) blockStart = offset
      blockEnd = offset + line.length
      fence = nextFence(line, fence)
    }
    offset += line.length + 1
  }
  if (blockStart >= 0) {
    blocks.push({ source: value.slice(blockStart, blockEnd), start: blockStart, end: blockEnd })
  }
  return blocks
}
