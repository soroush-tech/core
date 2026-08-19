import {
  useContext,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { styled } from '@soroush.tech/design-system'
import { View } from '@soroush.tech/design-system/View'
import { MarkdownContext } from '../MarkdownContext'
import { Preview, type PreviewSlotProps } from '../Preview'
import { blockToMarkdown } from '../utils/blockToMarkdown'
import { splitBlocks, type MarkdownBlock } from '../utils/splitBlocks'

// Named styled roots - theme-customizable via
// `theme.components.MarkdownLiveEdit.styleOverrides.root` / `.block`.
const LiveEditRoot = styled(View, { name: 'MarkdownLiveEdit', label: 'MarkdownLiveEdit' })({
  minWidth: 0,
  maxWidth: '100%',
  overflowWrap: 'break-word',
})

const LiveEditBlock = styled(View, {
  name: 'MarkdownLiveEdit',
  slot: 'block',
  label: 'MarkdownLiveEditBlock',
})(({ theme }) => ({
  cursor: 'text',
  borderRadius: theme?.radii?.sm,
  '&:hover, &:focus-within, &:focus': {
    outline: `${theme?.borderWidths?.thin} dashed ${theme?.border?.primary}`,
    outlineOffset: '2px',
  },
  '&:empty::before': {
    content: 'attr(data-placeholder)',
    color: theme?.text?.secondary,
  },
}))

// A mermaid fence renders as an SVG diagram - there is no text to edit in place.
const MERMAID_FENCE = /^\s{0,3}(?:`{3,}|~{3,})\s*mermaid\b/

const noop = () => {}

/** An empty document still needs one editable block to type into. */
const toBlocks = (value: string): MarkdownBlock[] => {
  const blocks = splitBlocks(value)
  return blocks.length > 0 ? blocks : [{ source: '', start: 0, end: value.length }]
}

interface EditableBlockProps {
  index: number
  source: string
  isEditable: boolean
  placeholder?: string
  slotProps?: PreviewSlotProps
  onEdit: (index: number, element: HTMLElement) => void
  onDone: () => void
}

/**
 * One contentEditable block. The preview element is created once per mount -
 * while the browser owns the DOM during typing, React must never reconcile
 * the subtree under the caret. The parent remounts the block (source-derived
 * key) whenever its markdown actually changes.
 */
function EditableBlock({
  index,
  source,
  isEditable,
  placeholder,
  slotProps,
  onEdit,
  onDone,
}: Readonly<EditableBlockProps>) {
  const [content] = useState<ReactNode>(() =>
    source === '' ? null : <Preview slotProps={slotProps}>{source}</Preview>
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.currentTarget.blur()
  }

  return (
    <LiveEditBlock
      aria-label="Edit block"
      tabIndex={isEditable ? 0 : undefined}
      contentEditable={isEditable}
      suppressContentEditableWarning
      data-placeholder={source === '' ? placeholder : undefined}
      onInput={(event: FormEvent<HTMLElement>) => onEdit(index, event.currentTarget)}
      onBlur={onDone}
      onKeyDown={handleKeyDown}
    >
      {content}
    </LiveEditBlock>
  )
}

export interface LiveEditProps {
  /** Standalone source value - used when rendered outside a `Control`. Ignored inside one. */
  value?: string
  /** Standalone change handler - used when rendered outside a `Control`. Ignored inside one. */
  onChange?: (value: string) => void
  /** Shown inside the (empty) document's first block until something is typed. */
  placeholder?: string
  /** Per-element prop overrides forwarded to every block's preview. */
  slotProps?: PreviewSlotProps
}

/**
 * A preview you write on directly: the document renders exactly like
 * `Preview`, split into blocks, and every block is `contentEditable` - no
 * textarea. While a block is being typed in, the browser owns its DOM; each
 * input serializes that block back to markdown and splices it into `value`,
 * so `onChange` stays live and untouched blocks keep their exact source.
 * Blur (or Escape) re-splits the document. Mermaid blocks are read-only -
 * a diagram has no text to edit in place. Inside a `Control` it is driven by
 * context; standalone it is a plain controlled component.
 */
export function LiveEdit({
  value: valueProp,
  onChange: onChangeProp,
  placeholder = 'Click to start writing...',
  slotProps,
}: Readonly<LiveEditProps>) {
  const context = useContext(MarkdownContext)
  const value = context?.value ?? valueProp ?? ''
  const onChange = context?.onChange ?? onChangeProp ?? noop

  const [blocks, setBlocks] = useState<MarkdownBlock[]>(() => toBlocks(value))
  // Bumped on every re-split so all blocks remount - browser-edited DOM must
  // never be reconciled, only replaced wholesale.
  const [generation, setGeneration] = useState(0)

  // Live character offsets per rendered block. Commits move them without a
  // re-render (a re-split would remount the block under the user's caret), so
  // they live outside state, keyed by generation and rebuilt lazily in handlers.
  const offsetsRef = useRef<{
    generation: number
    offsets: Array<{ start: number; end: number }>
  } | null>(null)

  const getOffsets = () => {
    if (offsetsRef.current?.generation !== generation) {
      offsetsRef.current = {
        generation,
        offsets: blocks.map(({ start, end }) => ({ start, end })),
      }
    }
    return offsetsRef.current.offsets
  }

  const resplit = (next: string) => {
    setBlocks(toBlocks(next))
    setGeneration((current) => current + 1)
  }

  // The document as last seen by this component - commits update it directly;
  // anything else arriving through `value` is an external change to re-split.
  const syncedValueRef = useRef(value)
  if (value !== syncedValueRef.current) {
    syncedValueRef.current = value
    resplit(value)
  }

  const handleEdit = (index: number, element: HTMLElement) => {
    const markdown = blockToMarkdown(element)
    const offsets = getOffsets()
    const block = offsets[index]
    const current = syncedValueRef.current
    const next = current.slice(0, block.start) + markdown + current.slice(block.end)

    const delta = markdown.length - (block.end - block.start)
    block.end = block.start + markdown.length
    for (const later of offsets.slice(index + 1)) {
      later.start += delta
      later.end += delta
    }
    syncedValueRef.current = next
    onChange(next)
  }

  // Leaving a block re-splits: edits that grew blank lines become new blocks,
  // and the edited block re-renders from its (serialized) markdown.
  const handleDone = () => resplit(syncedValueRef.current)

  return (
    <LiveEditRoot>
      {blocks.map((block, index) => (
        <EditableBlock
          key={`${generation}:${index}`}
          index={index}
          source={block.source}
          isEditable={!MERMAID_FENCE.test(block.source)}
          placeholder={placeholder}
          slotProps={slotProps}
          onEdit={handleEdit}
          onDone={handleDone}
        />
      ))}
    </LiveEditRoot>
  )
}
