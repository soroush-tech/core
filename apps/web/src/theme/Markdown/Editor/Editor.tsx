import { useContext, useEffect, useRef, type KeyboardEvent, type SyntheticEvent } from 'react'
import { Flex } from 'src/theme/Flex'
import { Typography } from 'src/theme/Typography'
import {
  TextInput,
  type TextInputColor,
  type TextInputSize,
  type TextInputTextColor,
  type TextInputVariant,
} from 'src/theme/TextInput'
import { applyAction } from 'src/theme/Markdown/utils/applyAction'
import { MarkdownContext, type MarkdownSelection } from 'src/theme/Markdown/MarkdownContext'
import type { LinePrefixAction } from 'src/theme/Markdown/const'

// Tab indents: a single tab at the caret, or one tab per line for a multi-line selection.
const INDENT_ACTION: LinePrefixAction = {
  id: 'indent',
  label: '',
  ariaLabel: '',
  kind: 'linePrefix',
  linePrefix: '\t',
}

const noop = () => {}

export interface EditorProps {
  /** Standalone source value — used when rendered outside a `Control`. Ignored inside one. */
  value?: string
  /** Standalone change handler — used when rendered outside a `Control`. Ignored inside one. */
  onChange?: (value: string) => void
  /** Placeholder shown while the source is empty. */
  placeholder?: string
  /** Minimum visible rows of the source textarea. Default: `16`. */
  minRows?: number
  /** Visual style of the source input — forwarded to `TextInput`. Default: `'default'`. */
  variant?: TextInputVariant
  /** Focus/active border colour — forwarded to `TextInput`. */
  color?: TextInputColor
  /** Text colour of the typed source — forwarded to `TextInput`. Default: `'initial'`. */
  textColor?: TextInputTextColor
  /** Padding/font-size density — forwarded to `TextInput`. */
  size?: TextInputSize
  /** Native `name` on the textarea — set it for native `<form>` submission / FormData. */
  name?: string
  /** `id` for label association. Falls back to the enclosing `FormControl`. */
  id?: string
  /** Marks the field invalid (error border). Falls back to the enclosing `FormControl`. */
  error?: boolean
  /** Marks the field required. Falls back to the enclosing `FormControl`. */
  required?: boolean
  /** Disables editing. Falls back to the enclosing `FormControl`. */
  disabled?: boolean
  /** Shows a one-line hint about the Tab / focus-release shortcuts under the field. Default: `true`. */
  showShortcutHint?: boolean
}

/**
 * The source `<textarea>`, with selection tracking and Tab-to-indent. Inside a `Control` it is
 * driven by context (so the `Toolbar` can act on it); on its own it is a plain controlled field
 * via `value`/`onChange`.
 */
export function Editor({
  value: valueProp,
  onChange: onChangeProp,
  placeholder = 'Write your article in Markdown…',
  minRows = 16,
  variant,
  color,
  textColor = 'initial',
  size,
  name,
  id,
  error,
  required,
  disabled,
  showShortcutHint = true,
}: Readonly<EditorProps>) {
  const context = useContext(MarkdownContext)
  // Standalone (no Control) keeps its own pending-selection here — there is no Toolbar to share it.
  const localPendingRef = useRef<MarkdownSelection | null>(null)

  // Prefer the Control context when present; otherwise fall back to standalone props.
  const value = context?.value ?? valueProp ?? ''
  const onChange = context?.onChange ?? onChangeProp ?? noop

  // TextInput doesn't expose a ref to its inner <textarea>, so reach it through the pane.
  const paneRef = useRef<HTMLDivElement | null>(null)

  const queueSelection = (selection: MarkdownSelection) => {
    if (context) context.queueSelection(selection)
    else localPendingRef.current = selection
  }

  const takeQueuedSelection = () => {
    if (context) return context.takeQueuedSelection()
    const selection = localPendingRef.current
    localPendingRef.current = null
    return selection
  }

  // Report the caret to the Control (so the Toolbar acts on it). No-op standalone — no Toolbar.
  const rememberSelection = (event: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!context) return
    const { selectionStart, selectionEnd } = event.currentTarget as HTMLTextAreaElement
    context.rememberSelection({ start: selectionStart, end: selectionEnd })
  }

  // Tab inserts a real tab (U+0009) instead of moving focus; Ctrl/Cmd+Shift+M releases the field.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = event.currentTarget as HTMLTextAreaElement
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'm') {
      event.preventDefault()
      el.blur()
      return
    }
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault()
      const { selectionStart, selectionEnd } = el
      const next = value.slice(selectionStart, selectionEnd).includes('\n')
        ? applyAction(INDENT_ACTION, { value, selectionStart, selectionEnd })
        : {
            value: value.slice(0, selectionStart) + '\t' + value.slice(selectionEnd),
            selectionStart: selectionStart + 1,
            selectionEnd: selectionStart + 1,
          }
      queueSelection({ start: next.selectionStart, end: next.selectionEnd })
      onChange(next.value)
    }
  }

  // After a dispatched action or Tab re-renders with the new value, restore focus and place the
  // caret/selection around the inserted markup so typing continues in place.
  useEffect(() => {
    const selection = takeQueuedSelection()
    if (!selection) return
    // The pane always contains the textarea while the Editor is mounted.
    const textarea = paneRef.current!.querySelector('textarea')!
    textarea.focus()
    textarea.setSelectionRange(selection.start, selection.end)
  })

  return (
    <Flex ref={paneRef} flexDirection="column" flex={1} minWidth={0} gap={1}>
      <TextInput
        multiline
        resize
        fullWidth
        variant={variant}
        color={color}
        textColor={textColor}
        size={size}
        name={name}
        id={id}
        error={error}
        required={required}
        disabled={disabled}
        minRows={minRows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        inputProps={{
          'aria-label': 'Markdown source',
          onSelect: rememberSelection,
          onBlur: rememberSelection,
          onKeyDown: handleKeyDown,
        }}
      />
      {showShortcutHint && (
        <Typography variant="caption" color="secondary" m={0}>
          Tab inserts a tab · press Ctrl/Cmd+Shift+M to move focus out.
        </Typography>
      )}
    </Flex>
  )
}
