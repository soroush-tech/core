import { renderHook } from '@testing-library/react'
import { useWindowTitle } from './useWindowTitle'

describe('useWindowTitle', () => {
  it('names the open document, since Electron takes the window title from the page', () => {
    renderHook(() => useWindowTitle('notes.md', false))
    expect(document.title).toBe('notes.md - Soroush Editor')
  })

  it('marks an unsaved document', () => {
    renderHook(() => useWindowTitle('notes.md', true))
    expect(document.title).toBe('• notes.md - Soroush Editor')
  })

  it('follows the document as it changes', () => {
    const { rerender } = renderHook(({ name, isDirty }) => useWindowTitle(name, isDirty), {
      initialProps: { name: 'Untitled', isDirty: false },
    })
    expect(document.title).toBe('Untitled - Soroush Editor')

    rerender({ name: 'todo.md', isDirty: true })
    expect(document.title).toBe('• todo.md - Soroush Editor')
  })
})
