import { useState, type SyntheticEvent } from 'react'
import { Flex } from '@soroush.tech/design-system/Flex'
import {
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonValue,
} from '@soroush.tech/design-system/ToggleButton'
import { Control, Editor, LiveEdit, Preview, Toolbar } from '@soroush.tech/markdown'

export interface EditorSelection {
  start: number
  end: number
}

/** The document surfaces the mode switcher toggles between. */
export type DocumentViewMode = 'live' | 'edit' | 'split' | 'preview'

/** The modes that keep the source textarea, and so a document-offset selection. */
const HAS_SOURCE = new Set<DocumentViewMode>(['edit', 'split'])

export interface DocumentEditorProps {
  value: string
  onChange: (value: string) => void
  /** Reports the source textarea's selection range as it changes. */
  onSelectionChange?: (selection: EditorSelection) => void
}

/**
 * The markdown editing surface, switchable between four modes: Live edit
 * (Preview-rendered blocks editable in place), Edit (source only), Split
 * (source and preview side by side), and Preview (rendered, read-only).
 */
export function DocumentEditor({
  value,
  onChange,
  onSelectionChange,
}: Readonly<DocumentEditorProps>) {
  const [mode, setMode] = useState<DocumentViewMode>('split')

  // `select` bubbles from the source textarea; the preview pane has none.
  const handleSelect = (event: SyntheticEvent) => {
    const target = event.target as HTMLTextAreaElement
    if (target.tagName !== 'TEXTAREA' || !onSelectionChange) return
    onSelectionChange({ start: target.selectionStart, end: target.selectionEnd })
  }

  const handleModeChange = (next: ToggleButtonValue | ToggleButtonValue[] | null) => {
    // Clicking the active mode reports null — the surface always keeps a mode.
    if (next === null) return
    const mode = next as DocumentViewMode
    setMode(mode)
    // Source-textarea offsets are meaningless once that textarea is gone — but
    // edit and split both keep it, and clearing there would leave text visibly
    // highlighted while the panel had already moved on to the whole document.
    if (!HAS_SOURCE.has(mode)) onSelectionChange?.({ start: 0, end: 0 })
  }

  return (
    <Control value={value} onChange={onChange}>
      <Flex
        flexDirection="column"
        gap={2}
        flex={1}
        minHeight={0}
        // Selection offsets are document offsets only in the source textarea —
        // Live edit's inline block editor emits block-relative ones.
      >
        <>
          <Flex flexDirection="row" justifyContent="space-between">
            <Toolbar />
            <ToggleButtonGroup
              isExclusive
              value={mode}
              onChange={handleModeChange}
              color="primary"
              size="sm"
              borderRadius="sq"
              aria-label="View mode"
            >
              <ToggleButton value="live">Live edit</ToggleButton>
              <ToggleButton value="edit">Edit</ToggleButton>
              <ToggleButton value="split">Split</ToggleButton>
              <ToggleButton value="preview">Preview</ToggleButton>
            </ToggleButtonGroup>
          </Flex>
          <Flex
            flexDirection="row"
            gap={3}
            flex={1}
            // Selection offsets are document offsets only in the source textarea
            // (edit/split) — Live edit's blocks emit block-relative ones.
            onSelect={mode === 'edit' || mode === 'split' ? handleSelect : undefined}
          >
            {/* maxRows keeps the source field inside the pane (it scrolls
                internally) so its border box never outgrows the visible area. */}
            {mode === 'edit' && <Editor minRows={12} maxRows={20} />}

            {mode === 'split' && (
              <Flex flexDirection="row" gap={3} flex={1}>
                <Editor minRows={12} />
                <Flex flexDirection="column" flex={1} minWidth={0}>
                  <Preview>{value}</Preview>
                </Flex>
              </Flex>
            )}

            {mode === 'preview' && (
              <Flex flexDirection="column" flex={1} minWidth={0}>
                <Preview>{value}</Preview>
              </Flex>
            )}
            {mode === 'live' && (
              <Flex flexDirection="column" flex={1} minWidth={0}>
                <LiveEdit />
              </Flex>
            )}
          </Flex>
        </>
      </Flex>
    </Control>
  )
}
