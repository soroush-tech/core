const isBlank = (line: string): boolean => line.trim() === ''

/** A shields.io-style badge line, e.g. `[![npm version](…)](…)`. */
const isBadge = (line: string): boolean => /^\s*\[!\[/.test(line)

/** A top-level `# ` heading (not `##`+). */
const isH1 = (line: string): boolean => /^#\s/.test(line.trim())

/**
 * Removes a README's top chrome — the leading `# ` title and the badge block beneath it —
 * so a package page can render the body without duplicating the title shown in its hero, and
 * without broken badge images (shields.io is outside the page CSP `img-src`). Only the leading
 * block is stripped; a `# ` heading or badge appearing later in the body is left untouched.
 */
export function stripReadmeChrome(markdown: string): string {
  const lines = markdown.split('\n')
  let start = 0
  while (start < lines.length && isBlank(lines[start])) start++
  if (start < lines.length && isH1(lines[start])) start++
  while (start < lines.length && (isBlank(lines[start]) || isBadge(lines[start]))) start++
  return lines.slice(start).join('\n')
}
