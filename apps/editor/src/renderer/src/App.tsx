import { Flex } from '@soroush.tech/design-system/Flex'
import { Sidebar } from '@soroush.tech/design-system/Sidebar'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { Typography } from '@soroush.tech/design-system/Typography'
import { useEffect, useState } from 'react'
import { ClaudePanel } from './common/ClaudePanel'
import { DocumentEditor, type EditorSelection } from './common/DocumentEditor'
import { GitHubAuth } from './common/GitHubAuth'
import { useDocument } from './hooks/useDocument'
import { useUndoRedo } from './hooks/useUndoRedo'
import { editorTheme } from './theme/editorTheme'
import { GlobalStyles } from './theme/GlobalStyles'

export function App() {
  const { content, filePath, isDirty, error, change, newDocument, open, save } = useDocument()
  const { undo, redo, reset } = useUndoRedo(content, change)
  const [selection, setSelection] = useState<EditorSelection>({ start: 0, end: 0 })

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
        {/* Icons-only rail: the panel column opens independently of `isOpen`,
            so there is no label state to carry for a single-item rail. */}
        <Sidebar aria-label="Editor panels" isOpen={false} hasPanel panelWidth="20rem">
          <GitHubAuth />
        </Sidebar>
        <Flex flexDirection="column" gap={2} p={3} flex={1} minWidth={0}>
          <Typography variant="body2" color="secondary" m={0}>
            {filePath ?? 'Untitled'}
            {isDirty ? ' •' : ''}
          </Typography>
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
