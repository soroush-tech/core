/**
 * Code points rather than the characters themselves: four of these are
 * invisible, and source nobody can read is source nobody can check.
 *
 * Removed outright - nothing in a markdown document means anything by them.
 */
const REMOVED = [
  0x200b, // zero-width space
  0x2060, // word joiner
  0xfeff, // byte order mark
  0x00ad, // soft hyphen
]

/**
 * Swapped for their plain equivalent, one character for one - so a spaced dash
 * keeps its spaces and an unspaced one gains none.
 */
const REPLACED = [
  { points: [0x00a0, 0x202f, 0x2009], plain: ' ' }, // no-break, narrow no-break, thin space
  { points: [0x2018, 0x2019, 0x201a, 0x201b], plain: "'" }, // curly single quotes
  { points: [0x201c, 0x201d, 0x201e], plain: '"' }, // curly double quotes
  { points: [0x2013, 0x2014, 0x2212], plain: '-' }, // en dash, em dash, minus sign
  { points: [0x2026], plain: '...' }, // ellipsis
]

/** A character class matching exactly the given code points. */
const anyOf = (points: number[]) =>
  new RegExp(`[${points.map((point) => String.fromCodePoint(point)).join('')}]`, 'g')

/**
 * The plain equivalent of the typography a model reaches for and a person
 * typing markdown rarely does: curly quotes, long dashes, an ellipsis
 * character, and the spaces that look like a space but are not.
 *
 * Three invisible characters are deliberately left alone, because they carry
 * meaning and removing them corrupts the text rather than cleaning it: U+200C,
 * which Persian needs between the parts of a word; U+200D, which holds an emoji
 * sequence together; and U+200E/U+200F, which set the direction of mixed
 * right-to-left text.
 *
 * Applied to what Claude writes, never to the document's own text.
 */
export function normalizeTypography(text: string): string {
  const stripped = text.replace(anyOf(REMOVED), '')
  return REPLACED.reduce(
    (cleaned, { points, plain }) => cleaned.replace(anyOf(points), plain),
    stripped
  )
}
