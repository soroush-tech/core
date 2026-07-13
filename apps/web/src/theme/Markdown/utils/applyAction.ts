import type {
  InsertAction,
  LinePrefixAction,
  ToolbarAction,
  WrapAction,
} from 'src/theme/Markdown/const'

/** A markdown source string plus the current textarea selection range. */
export interface EditorSelection {
  value: string
  selectionStart: number
  selectionEnd: number
}

// A separating space is only needed when the neighbouring character would fuse with the marker
// — i.e. it is neither whitespace nor another Markdown emphasis delimiter. Treating delimiters as
// safe lets marks nest cleanly (e.g. bold then italic → **_text_**) instead of breaking apart.
const fusesWithMarker = (char: string) => !/[\s*_~`]/.test(char)

// If the selection is already wrapped by the markers — whether they sit inside the selection
// or immediately outside it — return the unwrapped result (toggle off); otherwise null.
function stripWrap(
  action: WrapAction,
  { value, selectionStart, selectionEnd }: EditorSelection
): EditorSelection | null {
  const { prefix, suffix } = action
  const selected = value.slice(selectionStart, selectionEnd)
  // An untouched placeholder injection is dropped entirely on toggle (markers and text), not
  // left behind as bare text.
  const keep = (content: string) => (content === action.placeholder ? '' : content)

  if (
    selected.length >= prefix.length + suffix.length &&
    selected.startsWith(prefix) &&
    selected.endsWith(suffix)
  ) {
    const core = keep(selected.slice(prefix.length, selected.length - suffix.length))
    return {
      value: value.slice(0, selectionStart) + core + value.slice(selectionEnd),
      selectionStart,
      selectionEnd: selectionStart + core.length,
    }
  }

  if (
    selectionStart >= prefix.length &&
    value.slice(selectionStart - prefix.length, selectionStart) === prefix &&
    value.slice(selectionEnd, selectionEnd + suffix.length) === suffix
  ) {
    const start = selectionStart - prefix.length
    const core = keep(selected)
    return {
      value: value.slice(0, start) + core + value.slice(selectionEnd + suffix.length),
      selectionStart: start,
      selectionEnd: start + core.length,
    }
  }

  return null
}

// Inline mark (bold/italic/…): keep the selection's padding outside the markers, and insert a
// separating space if the token would butt up against neighbouring text so it always renders.
function wrapInline(
  action: WrapAction,
  { value, selectionStart, selectionEnd }: EditorSelection
): EditorSelection {
  const selected = value.slice(selectionStart, selectionEnd)
  const leadingLength = selected.length - selected.trimStart().length
  const trailingLength = selected.length - selected.trimEnd().length
  const core = selected.slice(leadingLength, selected.length - trailingLength) || action.placeholder

  let before = selected.slice(0, leadingLength)
  if (!before && selectionStart > 0 && fusesWithMarker(value[selectionStart - 1])) before = ' '
  let after = selected.slice(selected.length - trailingLength)
  if (!after && selectionEnd < value.length && fusesWithMarker(value[selectionEnd])) after = ' '

  const value_ =
    value.slice(0, selectionStart) +
    before +
    action.prefix +
    core +
    action.suffix +
    after +
    value.slice(selectionEnd)
  const start = selectionStart + before.length + action.prefix.length
  return { value: value_, selectionStart: start, selectionEnd: start + core.length }
}

// Block fence (code block): put the fence on its own line — add a newline before/after unless
// the neighbouring character is already a line break (or the document edge).
function wrapBlock(
  action: WrapAction,
  { value, selectionStart, selectionEnd }: EditorSelection
): EditorSelection {
  const core = value.slice(selectionStart, selectionEnd) || action.placeholder
  const before = selectionStart > 0 && value[selectionStart - 1] !== '\n' ? '\n' : ''
  const after = selectionEnd < value.length && value[selectionEnd] !== '\n' ? '\n' : ''

  const value_ =
    value.slice(0, selectionStart) +
    before +
    action.prefix +
    core +
    action.suffix +
    after +
    value.slice(selectionEnd)
  const start = selectionStart + before.length + action.prefix.length
  return { value: value_, selectionStart: start, selectionEnd: start + core.length }
}

function applyWrap(action: WrapAction, selection: EditorSelection): EditorSelection {
  if (action.block) return wrapBlock(action, selection)
  return stripWrap(action, selection) ?? wrapInline(action, selection)
}

// Applies a line marker to one line. For a `family` action it first strips any sibling marker,
// then toggles its own off (marker already present) or adds/replaces it; otherwise it just prepends.
function toggleLinePrefix(action: LinePrefixAction, line: string): string {
  if (!action.family) return action.linePrefix + line
  const existing = action.family.exec(line)?.[0] ?? ''
  const stripped = line.slice(existing.length)
  // Own marker already present: toggle it off, unless the action is replace-only (e.g. headings).
  if (existing === action.linePrefix && action.toggle !== false) return stripped
  return action.linePrefix + stripped
}

function applyLinePrefix(
  action: LinePrefixAction,
  { value, selectionStart, selectionEnd }: EditorSelection
): EditorSelection {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const nextNewline = value.indexOf('\n', selectionEnd)
  const lineEnd = nextNewline === -1 ? value.length : nextNewline
  const prefixed = value
    .slice(lineStart, lineEnd)
    .split('\n')
    .map((line) => toggleLinePrefix(action, line))
    .join('\n')
  const value_ = value.slice(0, lineStart) + prefixed + value.slice(lineEnd)
  return { value: value_, selectionStart: lineStart, selectionEnd: lineStart + prefixed.length }
}

function applyInsert(
  action: InsertAction,
  { value, selectionStart, selectionEnd }: EditorSelection
): EditorSelection {
  const value_ = value.slice(0, selectionStart) + action.snippet + value.slice(selectionEnd)
  const caret = selectionStart + action.snippet.length
  return { value: value_, selectionStart: caret, selectionEnd: caret }
}

/**
 * Pure transform: applies a toolbar `action` to the given selection and returns the next
 * source plus the selection to restore around the inserted markdown. No DOM access.
 */
export function applyAction(action: ToolbarAction, selection: EditorSelection): EditorSelection {
  switch (action.kind) {
    case 'wrap':
      return applyWrap(action, selection)
    case 'linePrefix':
      return applyLinePrefix(action, selection)
    case 'insert':
      return applyInsert(action, selection)
  }
}
