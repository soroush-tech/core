import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { Typography } from '@soroush.tech/design-system/Typography'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ClaudePanel } from './common/ClaudePanel'
import { DocumentEditor, type EditorSelection } from './common/DocumentEditor'
import { EditorSidebar } from './common/EditorSidebar'
import { useDocument } from './hooks/useDocument'
import { useUndoRedo } from './hooks/useUndoRedo'
import { useWindowTitle } from './hooks/useWindowTitle'
import { editorTheme } from './theme/editorTheme'
import { GlobalStyles } from './theme/GlobalStyles'

export function App() {
  const {
    content,
    filePath,
    origin,
    isDirty,
    revision,
    error,
    change,
    newDocument,
    open,
    load,
    save,
  } = useDocument()
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

  // With a selection, Claude works on it; without one, on the whole document
  // (which may be empty — pure generation).
  const targetText = hasSelection ? content.slice(start, end) : content

  // What is in front of the user when an answer arrives — which document, and
  // what is in it — rather than the copy captured when it was asked for.
  const live = useRef({ content, revision })
  useLayoutEffect(() => {
    live.current = { content, revision }
  }, [content, revision])

  // What Claude was actually asked about, and the text that was in it. Held
  // from the moment the request starts, because the selection can move — or
  // collapse — while it runs, and an answer about a selection must never be
  // applied as a whole document.
  const asked = useRef({ start, end, text: targetText, revision })
  const beginEdit = () => {
    asked.current = { start, end, text: targetText, revision }
  }

  /**
   * Splices the rewrite over what Claude was given — but only if it is still
   * the same document, and that text is still exactly where it was. Typing,
   * undo/redo, or opening another file while the request runs would otherwise
   * land the answer at shifted offsets, or in a document Claude never saw.
   * Returns false when it was dropped, so the panel can say so rather than
   * losing it silently.
   */
  const applyEdit = (rewritten: string) => {
    const { content: current, revision: now } = live.current
    const { start: from, end: to, text, revision: asWas } = asked.current

    // Matching text is not the same document: an empty one and a new one are
    // always alike, and two files can hold the same thing.
    if (now !== asWas) return false

    // Nothing was selected, so Claude was given the whole document.
    if (from === to) {
      if (current !== text) return false
      change(rewritten)
      return true
    }

    if (current.slice(from, to) !== text) return false
    change(current.slice(0, from) + rewritten + current.slice(to))
    setSelection({ start: from, end: from + rewritten.length })
    return true
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
            targetText={targetText}
            isSelection={hasSelection}
            onStart={beginEdit}
            onApply={applyEdit}
          />
        </Flex>
      </Flex>
    </ThemeProvider>
  )
}
