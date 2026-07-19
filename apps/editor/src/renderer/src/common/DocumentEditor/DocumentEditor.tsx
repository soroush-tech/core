import type { SyntheticEvent } from 'react'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Control, Editor, Preview, Toolbar } from '@soroush.tech/markdown'

export interface EditorSelection {
  start: number
  end: number
}

export interface DocumentEditorProps {
  value: string
  onChange: (value: string) => void
  /** Reports the source textarea's selection range as it changes. */
  onSelectionChange?: (selection: EditorSelection) => void
}

/** The markdown editing surface: formatting toolbar, source editor, and live preview. */
export function DocumentEditor({
  value,
  onChange,
  onSelectionChange,
}: Readonly<DocumentEditorProps>) {
  // `select` bubbles from the source textarea; the preview pane has none.
  const handleSelect = (event: SyntheticEvent) => {
    const target = event.target as HTMLTextAreaElement
    if (target.tagName !== 'TEXTAREA' || !onSelectionChange) return
    onSelectionChange({ start: target.selectionStart, end: target.selectionEnd })
  }

  return (
    <Control value={value} onChange={onChange}>
      <Flex flexDirection="column" gap={2} flex={1} minHeight={0} onSelect={handleSelect}>
        <Toolbar />
        <Flex flexDirection="row" gap={3} flex={1} minHeight={0}>
          <Editor minRows={24} />
          <Flex flexDirection="column" flex={1} minWidth={0} overflow="auto">
            <Preview>{value}</Preview>
          </Flex>
        </Flex>
      </Flex>
    </Control>
  )
}
