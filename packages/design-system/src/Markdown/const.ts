import type { IconName } from '../Icon'

/** How a text label is rendered — mirrors the mark it inserts. */
export type ToolbarLabelEmphasis = 'bold' | 'italic' | 'strike'

/** Shared presentation for a toolbar control. */
interface BaseAction {
  id: string
  /** Text label shown when no `icon` is set. */
  label: string
  /** Accessible name — always the control's aria-label. */
  ariaLabel: string
  /** Registry icon shown instead of the text label. */
  icon?: IconName
  /** Styles the text label to mirror the mark (e.g. bold `B`). Ignored when `icon` is set. */
  emphasis?: ToolbarLabelEmphasis
  /** Consecutive actions sharing a group id render as one joined button cluster. */
  group?: string
}

/** Wraps the selection (or a placeholder) in a leading/trailing marker — bold, links, code blocks. */
export interface WrapAction extends BaseAction {
  kind: 'wrap'
  prefix: string
  suffix: string
  placeholder: string
  /** Block-level fence (e.g. code block): separated by newlines and never toggled off. */
  block?: boolean
}

/** Prepends a marker to every line the selection touches — headings, quotes, lists. */
export interface LinePrefixAction extends BaseAction {
  kind: 'linePrefix'
  linePrefix: string
  /**
   * Line-start pattern for a family of mutually-exclusive markers (e.g. all list types). When
   * set, applying the action strips any matching marker first, then toggles its own off or
   * replaces a sibling's — so the list/ordered/task buttons swap and toggle instead of stacking.
   */
  family?: RegExp
  /**
   * Whether re-applying an action that already owns the line's marker removes it. Defaults to
   * toggling off; set `false` for replace-only families (e.g. heading levels from a select,
   * where picking a level should set it, not toggle it away).
   */
  toggle?: boolean
}

/** Inserts a standalone snippet at the caret, ignoring the selection — tables, rules. */
export interface InsertAction extends BaseAction {
  kind: 'insert'
  snippet: string
}

export type ToolbarAction = WrapAction | LinePrefixAction | InsertAction

// Any list marker at the start of a line — lets the list/ordered/task buttons toggle and replace
// one another. Task (`- [ ] `) is listed before the bare bullet so it matches in full.
const LIST_MARKER = /^(?:- \[[ xX]\] |- |\d+\. )/
// The blockquote marker — a one-member family, so the quote button simply toggles on/off.
const QUOTE_MARKER = /^> /

/**
 * Every formatting action the toolbar exposes — one per markdown feature the `Markdown`
 * renderer supports (GFM + the component map in `Markdown.Preview`). Data-driven so the
 * toolbar and the transform logic stay in sync.
 */
export const TOOLBAR_ACTIONS: readonly ToolbarAction[] = [
  {
    id: 'bold',
    label: 'B',
    ariaLabel: 'Bold',
    emphasis: 'bold',
    group: 'inline',
    kind: 'wrap',
    prefix: '**',
    suffix: '**',
    placeholder: 'bold text',
  },
  {
    id: 'italic',
    label: 'I',
    ariaLabel: 'Italic',
    emphasis: 'italic',
    group: 'inline',
    kind: 'wrap',
    prefix: '_',
    suffix: '_',
    placeholder: 'italic text',
  },
  {
    id: 'strikethrough',
    label: 'S',
    ariaLabel: 'Strikethrough',
    emphasis: 'strike',
    group: 'inline',
    kind: 'wrap',
    prefix: '~~',
    suffix: '~~',
    placeholder: 'struck text',
  },
  {
    id: 'quote',
    label: 'Quote',
    ariaLabel: 'Blockquote',
    icon: 'format_quote',
    kind: 'linePrefix',
    linePrefix: '> ',
    family: QUOTE_MARKER,
  },
  {
    id: 'ul',
    label: 'List',
    ariaLabel: 'Bulleted list',
    icon: 'format_list_bulleted',
    group: 'list',
    kind: 'linePrefix',
    linePrefix: '- ',
    family: LIST_MARKER,
  },
  {
    id: 'ol',
    label: 'Ordered',
    ariaLabel: 'Numbered list',
    icon: 'format_list_numbered',
    group: 'list',
    kind: 'linePrefix',
    linePrefix: '1. ',
    family: LIST_MARKER,
  },
  {
    id: 'task',
    label: 'Task',
    ariaLabel: 'Task list',
    icon: 'checklist',
    group: 'list',
    kind: 'linePrefix',
    linePrefix: '- [ ] ',
    family: LIST_MARKER,
  },
  {
    id: 'link',
    label: 'Link',
    ariaLabel: 'Link',
    icon: 'link',
    kind: 'wrap',
    prefix: '[',
    suffix: '](url)',
    placeholder: 'link text',
  },
  {
    id: 'image',
    label: 'Image',
    ariaLabel: 'Image',
    icon: 'image',
    kind: 'wrap',
    prefix: '![',
    suffix: '](url)',
    placeholder: 'alt text',
  },
  { id: 'hr', label: 'HR', ariaLabel: 'Horizontal rule', kind: 'insert', snippet: '\n\n---\n\n' },
]

/** Fence languages offered by the code-block select; `value` is appended after the opening ```. */
export const CODE_LANGUAGES: { label: string; value: string }[] = [
  { label: 'Plain', value: 'text' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JavaScript', value: 'js' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'JSON', value: 'json' },
  { label: 'Bash', value: 'bash' },
  { label: 'Python', value: 'python' },
  { label: 'Markdown', value: 'md' },
]

/** Inline `code` — rendered next to the code-block select so both code controls sit together. */
export const INLINE_CODE_ACTION: WrapAction = {
  id: 'inline-code',
  label: 'Code',
  ariaLabel: 'Inline code',
  icon: 'code',
  kind: 'wrap',
  prefix: '`',
  suffix: '`',
  placeholder: 'code',
}

/** Builds the fenced-code-block wrap action for a chosen `language`. */
export const codeBlockAction = (language: string): WrapAction => ({
  id: 'code-block',
  label: 'Code block',
  ariaLabel: 'Code block',
  kind: 'wrap',
  prefix: `\`\`\`${language}\n`,
  suffix: '\n```',
  placeholder: 'code',
  block: true,
})

// Any heading marker at the start of a line, so picking a level replaces the current one.
const HEADING_MARKER = /^#{1,6} /

const headingAction = (level: number): LinePrefixAction => ({
  id: `h${level}`,
  label: `H${level}`,
  ariaLabel: `Heading ${level}`,
  kind: 'linePrefix',
  linePrefix: `${'#'.repeat(level)} `,
  family: HEADING_MARKER,
  // Chosen from a select — picking a level sets it (replaces any current heading) rather than
  // toggling off when it matches.
  toggle: false,
})

/** Every heading level the `Markdown` renderer supports (h1–h6) — offered via the toolbar select. */
export const HEADING_ACTIONS: readonly LinePrefixAction[] = [1, 2, 3, 4, 5, 6].map(headingAction)
