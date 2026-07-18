import type { IconName } from '@soroush.tech/design-system/Icon'

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

/** A mermaid diagram type offered by the toolbar's diagram select, with a starter template. */
export interface MermaidDiagram {
  /** Shown in the select. */
  label: string
  /** Option value / id. */
  value: string
  /** The starter diagram body inserted inside a ` ```mermaid ` fence. */
  snippet: string
}

/**
 * Every mermaid diagram type the renderer can draw, each with a minimal valid starter, validated
 * against mermaid's own parser.
 */
export const MERMAID_DIAGRAMS: readonly MermaidDiagram[] = [
  { label: 'Flowchart', value: 'flowchart', snippet: 'graph TD\n  A[Start] --> B[End]' },
  {
    label: 'Sequence',
    value: 'sequence',
    snippet: 'sequenceDiagram\n  Alice->>Bob: Hello\n  Bob-->>Alice: Hi',
  },
  {
    label: 'Class',
    value: 'class',
    snippet:
      'classDiagram\n  class Animal {\n    +String name\n    +move()\n  }\n  Animal <|-- Dog',
  },
  {
    label: 'State',
    value: 'state',
    snippet: 'stateDiagram-v2\n  [*] --> Active\n  Active --> [*]',
  },
  {
    label: 'Entity Relationship',
    value: 'er',
    snippet: 'erDiagram\n  CUSTOMER ||--o{ ORDER : places',
  },
  {
    label: 'User Journey',
    value: 'journey',
    snippet: 'journey\n  title My Day\n  section Work\n    Code: 5: Me',
  },
  {
    label: 'Gantt',
    value: 'gantt',
    snippet:
      'gantt\n  title Schedule\n  dateFormat YYYY-MM-DD\n  section Phase\n    Task A :a1, 2024-01-01, 3d',
  },
  {
    label: 'Git',
    value: 'git',
    snippet: 'gitGraph\n  commit\n  branch develop\n  commit\n  checkout main\n  merge develop',
  },
  { label: 'Pie', value: 'pie', snippet: 'pie title Pets\n  "Dogs" : 40\n  "Cats" : 60' },
  {
    label: 'Mindmap',
    value: 'mindmap',
    snippet: 'mindmap\n  root((mindmap))\n    Origins\n    Tools',
  },
  {
    label: 'Timeline',
    value: 'timeline',
    snippet: 'timeline\n  title History\n  2021 : Started\n  2022 : Grew',
  },
  {
    label: 'Quadrant',
    value: 'quadrant',
    snippet:
      'quadrantChart\n  title Reach vs Effort\n  x-axis Low --> High\n  y-axis Low --> High\n  Campaign: [0.3, 0.6]',
  },
  {
    label: 'Requirement',
    value: 'requirement',
    snippet:
      'requirementDiagram\n  requirement test_req {\n    id: 1\n    text: the test text.\n    risk: high\n    verifymethod: test\n  }',
  },
  {
    label: 'C4',
    value: 'c4',
    snippet:
      'C4Context\n  title System Context\n  Person(user, "User")\n  System(sys, "System")\n  Rel(user, sys, "Uses")',
  },
  { label: 'Sankey', value: 'sankey', snippet: 'sankey-beta\n\nA,B,10\nA,C,5' },
  {
    label: 'XY',
    value: 'xy',
    snippet:
      'xychart-beta\n  title "Sales"\n  x-axis [jan, feb, mar]\n  y-axis "Revenue" 0 --> 100\n  bar [30, 50, 80]',
  },
  { label: 'Block', value: 'block', snippet: 'block-beta\n  columns 2\n  A B' },
  {
    label: 'Packet',
    value: 'packet',
    snippet: 'packet-beta\n  0-15: "Source Port"\n  16-31: "Destination Port"',
  },
  {
    label: 'Kanban',
    value: 'kanban',
    snippet: 'kanban\n  Todo\n    [Create sample]\n  Doing\n    [In progress]',
  },
  {
    label: 'Architecture',
    value: 'architecture',
    snippet:
      'architecture-beta\n  group api(cloud)[API]\n  service db(database)[Database] in api\n  service server(server)[Server] in api\n  server:R --> L:db',
  },
  {
    label: 'Radar',
    value: 'radar',
    snippet: 'radar-beta\n  axis a, b, c, d, e\n  curve c1{1, 2, 3, 4, 5}',
  },
  { label: 'Treemap', value: 'treemap', snippet: 'treemap\n  "Root"\n    "A": 10\n    "B": 20' },
]

/** Builds the insert action that drops a chosen mermaid diagram's starter as a fenced block. */
export const mermaidDiagramAction = (snippet: string): InsertAction => ({
  id: 'mermaid',
  label: 'Diagram',
  ariaLabel: 'Insert mermaid diagram',
  kind: 'insert',
  snippet: `\n\`\`\`mermaid\n${snippet}\n\`\`\`\n`,
})
