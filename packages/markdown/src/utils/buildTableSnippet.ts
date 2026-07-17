/**
 * Builds a GFM table snippet with `rows` total rows (a header row plus `rows - 1` body rows)
 * and `cols` columns, wrapped in blank lines so it sits on its own block.
 */
export function buildTableSnippet(rows: number, cols: number): string {
  const row = (cell: (index: number) => string) =>
    `| ${Array.from({ length: cols }, (_, index) => cell(index)).join(' | ')} |`
  const lines = [
    row((index) => `Column ${index + 1}`),
    row(() => '---'),
    ...Array.from({ length: rows - 1 }, () => row(() => 'Cell')),
  ]
  return `\n${lines.join('\n')}\n`
}
