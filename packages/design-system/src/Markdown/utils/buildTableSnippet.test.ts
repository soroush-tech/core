import { describe, it, expect } from 'vitest'
import { buildTableSnippet } from './buildTableSnippet'

describe('buildTableSnippet', () => {
  it('builds a header, divider, and body rows for the chosen size', () => {
    expect(buildTableSnippet(2, 2)).toBe(
      '\n| Column 1 | Column 2 |\n| --- | --- |\n| Cell | Cell |\n'
    )
  })

  it('omits body rows when only one row is requested', () => {
    expect(buildTableSnippet(1, 3)).toBe(
      '\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n'
    )
  })
})
