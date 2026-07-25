export interface MarkdownBlock {
  /** The block's markdown source, without surrounding blank lines. */
  source: string
  /** Character offset of `source` within the full document. */
  start: number
  /** Offset just past the last character of `source` (exclusive). */
  end: number
}

const FENCE = /^\s{0,3}(`{3,}|~{3,})/

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
      const fenceMatch = FENCE.exec(line)
      if (fenceMatch) {
        // A fence closes only on a marker of the same character, at least as long.
        if (fence === null) fence = fenceMatch[1]
        else if (fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null
      }
    }
    offset += line.length + 1
  }
  if (blockStart >= 0) {
    blocks.push({ source: value.slice(blockStart, blockEnd), start: blockStart, end: blockEnd })
  }
  return blocks
}
