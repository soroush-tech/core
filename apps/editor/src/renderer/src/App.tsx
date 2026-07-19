import { Flex } from '@soroush.tech/design-system/Flex'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { Typography } from '@soroush.tech/design-system/Typography'
import { useEffect, useState } from 'react'
import { AppToolbar } from './common/AppToolbar'
import { ClaudePanel } from './common/ClaudePanel'
import { DocumentEditor, type EditorSelection } from './common/DocumentEditor'
import { useDocument } from './hooks/useDocument'
import { useUndoRedo } from './hooks/useUndoRedo'
import { editorTheme } from './theme/editorTheme'
import { GlobalStyles } from './theme/GlobalStyles'

export function App() {
  const { content, filePath, isDirty, error, change, newDocument, open, save } = useDocument()
  const { undo, redo, reset, canUndo, canRedo } = useUndoRedo(content, change)
  const [selection, setSelection] = useState<EditorSelection>({ start: 0, end: 0 })

  // A different file on disk means a different document — its history starts fresh.
  useEffect(() => reset(), [filePath, reset])

  // Clamp against stale ranges after external content changes (open/undo/…).
  const start = Math.min(selection.start, content.length)
  const end = Math.min(selection.end, content.length)
  const selectedText = content.slice(start, end)

  const applyEdit = (rewritten: string) => {
    change(content.slice(0, start) + rewritten + content.slice(end))
    setSelection({ start, end: start + rewritten.length })
  }

  return (
    <ThemeProvider theme={editorTheme}>
      <GlobalStyles />
      <Flex flexDirection="column" gap={2} p={3} height="100vh">
        <AppToolbar
          filePath={filePath}
          isDirty={isDirty}
          canUndo={canUndo}
          canRedo={canRedo}
          onNew={() => void newDocument()}
          onOpen={() => void open()}
          onSave={() => void save()}
          onSaveAs={() => void save(true)}
          onUndo={undo}
          onRedo={redo}
        />
        {error && (
          <Typography role="alert" color="error" m={0}>
            {error}
          </Typography>
        )}
        <Flex flexDirection="row" gap={3} flex={1} minHeight={0}>
          <DocumentEditor value={content} onChange={change} onSelectionChange={setSelection} />
          <ClaudePanel selectedText={selectedText} onApply={applyEdit} />
        </Flex>
      </Flex>
    </ThemeProvider>
  )
}
