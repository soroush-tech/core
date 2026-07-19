import { useDocument } from './hooks/useDocument'

// Plain-element shell — replaced by the themed markdown editor layout in #298.
export function App() {
  const { content, filePath, isDirty, error, change, newDocument, open, save } = useDocument()

  return (
    <main>
      <header>
        <button type="button" onClick={() => void newDocument()}>
          New
        </button>
        <button type="button" onClick={() => void open()}>
          Open
        </button>
        <button type="button" onClick={() => void save()}>
          Save
        </button>
        <button type="button" onClick={() => void save(true)}>
          Save As
        </button>
        <span>
          {filePath ?? 'Untitled'}
          {isDirty ? ' •' : ''}
        </span>
        {error && <p role="alert">{error}</p>}
      </header>
      <textarea
        aria-label="Markdown source"
        value={content}
        onChange={(event) => change(event.target.value)}
      />
    </main>
  )
}
