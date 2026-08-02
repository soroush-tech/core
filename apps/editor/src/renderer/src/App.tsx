import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { Typography } from '@soroush.tech/design-system/Typography'
import { useEffect, useState } from 'react'
import { ClaudePanel } from './common/ClaudePanel'
import { DocumentEditor, type EditorSelection } from './common/DocumentEditor'
import { EditorSidebar } from './common/EditorSidebar'
import { useDocument } from './hooks/useDocument'
import { useUndoRedo } from './hooks/useUndoRedo'
import { useWindowTitle } from './hooks/useWindowTitle'
import { editorTheme } from './theme/editorTheme'
import { GlobalStyles } from './theme/GlobalStyles'

export function App() {
  const { content, filePath, origin, isDirty, error, change, newDocument, open, load, save } =
    useDocument()
  const { undo, redo, reset } = useUndoRedo(content, change)
  const [selection, setSelection] = useState<EditorSelection>({ start: 0, end: 0 })

  // A gist file has no path on disk, so it is named by its filename instead.
  const documentName = origin?.filename ?? filePath ?? 'Untitled'
  useWindowTitle(documentName, isDirty)

  // A different file on disk means a different document — its history starts fresh.
  useEffect(() => reset(), [filePath, reset])

  // File and undo/redo commands live in the application menu (see main/menu.ts).
  useEffect(
    () =>
      window.editorAPI.menu.onAction((action) => {
        const actions = {
          new: () => void newDocument(),
          open: () => void open(),
          save: () => void save(),
          // Save As always means a file on disk, gist origin or not.
          'save-as': () => void save(true),
          undo,
          redo,
        }
        actions[action]()
      }),
    [newDocument, open, save, undo, redo]
  )

  // Clamp against stale ranges after external content changes (open/undo/…).
  const start = Math.min(selection.start, content.length)
  const end = Math.min(selection.end, content.length)
  const hasSelection = start !== end

  // With a selection, the rewrite splices over it; without one, Claude works
  // on the whole document (which may be empty — pure generation).
  const applyEdit = (rewritten: string) => {
    if (!hasSelection) return change(rewritten)
    change(content.slice(0, start) + rewritten + content.slice(end))
    setSelection({ start, end: start + rewritten.length })
  }

  return (
    <ThemeProvider theme={editorTheme}>
      <GlobalStyles />
      <Flex flexDirection="row" height="100vh">
        {/* A gist file is a new document, so its history starts fresh — the
            filePath-keyed reset above cannot see it (filePath stays null). */}
        <EditorSidebar
          onOpenFile={(fileContent, fileOrigin) =>
            void load(fileContent, fileOrigin).then((loaded) => loaded && reset())
          }
        />
        <Flex flexDirection="column" gap={2} p={3} flex={1} minWidth={0}>
          <Flex flexDirection="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Typography variant="body2" color="secondary" m={0}>
              {documentName}
              {isDirty ? ' •' : ''}
            </Typography>
            {/* Ctrl+S does this too, but a gist file has to be saved before it
                can be published, so the step needs to be visible. */}
            <Button
              type="button"
              variant="outlined"
              size="sm"
              disabled={!isDirty}
              onClick={() => void save()}
            >
              {origin ? 'Save to sandbox' : 'Save'}
            </Button>
          </Flex>
          {error && (
            <Typography role="alert" color="error" m={0}>
              {error}
            </Typography>
          )}
          {/* The document scrolls inside this row so the chat bar below stays pinned.
            The 4px padding leaves room for TextInput's focus ring (2px outline +
            2px offset outside the box), which the scroll container would clip. */}
          <Flex flexDirection="row" gap={3} flex={1} minHeight={0} overflow="auto" p={0.5}>
            <DocumentEditor value={content} onChange={change} onSelectionChange={setSelection} />
          </Flex>
          <ClaudePanel
            targetText={hasSelection ? content.slice(start, end) : content}
            isSelection={hasSelection}
            onApply={applyEdit}
          />
        </Flex>
      </Flex>
    </ThemeProvider>
  )
}
