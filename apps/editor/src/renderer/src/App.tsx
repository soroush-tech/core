import { Flex } from '@soroush.tech/design-system/Flex'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { Typography } from '@soroush.tech/design-system/Typography'
import { useEffect } from 'react'
import { AppToolbar } from './common/AppToolbar'
import { DocumentEditor } from './common/DocumentEditor'
import { useDocument } from './hooks/useDocument'
import { useUndoRedo } from './hooks/useUndoRedo'
import { editorTheme } from './theme/editorTheme'
import { GlobalStyles } from './theme/GlobalStyles'

export function App() {
  const { content, filePath, isDirty, error, change, newDocument, open, save } = useDocument()
  const { undo, redo, reset, canUndo, canRedo } = useUndoRedo(content, change)

  // A different file on disk means a different document — its history starts fresh.
  useEffect(() => reset(), [filePath, reset])

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
        <DocumentEditor value={content} onChange={change} />
      </Flex>
    </ThemeProvider>
  )
}
