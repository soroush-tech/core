/**
 * Syntax-highlighting tokens for `CodeBlock` — mapped onto highlight.js token classes.
 * Not part of design-system's own scales; `../index.ts` augments
 * `@soroush.tech/design-system/theme` so `theme.syntax` is available wherever this
 * package is imported. Merge one of the presets below into your theme via
 * `createTheme(baseTheme, { syntax: syntaxDark })`, or supply your own.
 */
export interface ThemeSyntax {
  /** Default code text — plain identifiers, operators, punctuation. */
  base: string
  /** Keywords, built-ins, types, literals, selector tags. */
  keyword: string
  /** Strings, template literals, regular expressions. */
  string: string
  /** Numbers, symbols, links. */
  number: string
  /** Function / class titles, section headings, attributes. */
  title: string
  /** Fields, constants, and property keys. */
  constant: string
  /** Type and class names. */
  type: string
  /** Comments and quotes — rendered dimmed and italic. */
  comment: string
  /** Markup tags/names, meta, variables, deletions. */
  tag: string
  /** Font family for the code surface — independent of `theme.fonts.mono`. */
  font: string
}

const font = "'JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace"

/** Matched to the JetBrains "Islands Dark" editor scheme. */
export const syntaxDark: ThemeSyntax = {
  base: '#BBBBBB', // ≈ Islands text #bcbec4
  keyword: '#CF8E6D', // = Islands keyword #cf8e6d
  string: '#6AAB73', // = Islands string #6aab73
  number: '#2AACB8', // = Islands number #2aacb8
  title: '#6BA9FA', // ≈ Islands function #56a8f5
  constant: '#C77DBB', // = Islands field/constant #c77dbb
  type: '#2AACB8', // ≈ Islands type #16baac
  comment: '#919191', // ≈ Islands comment #7a7e85
  tag: '#D5B778', // = Islands markup tag #d5b778
  font,
}

/** Matched to the JetBrains "Islands Light" editor scheme. */
export const syntaxLight: ThemeSyntax = {
  base: '#080808', // = Islands text #080808
  keyword: '#0033B3', // = Islands keyword #0033b3
  string: '#067D17', // = Islands string #067d17
  number: '#1750EB', // = Islands number #1750eb
  title: '#00627A', // = Islands function #00627a
  constant: '#871094', // = Islands field/constant #871094
  type: '#007E8A', // = Islands type #007e8a
  comment: '#8C8C8C', // = Islands comment #8c8c8c
  tag: '#008077', // = Islands markup tag #008077
  font,
}
