import { useEffect } from 'react'

const APP_NAME = 'Soroush Editor'

/**
 * Mirrors the open document into the window title. Electron takes the window
 * title from the page title, so setting it here is all that is needed — the
 * leading dot matches the unsaved marker shown beside the name in the app.
 */
export function useWindowTitle(name: string, isDirty: boolean): void {
  useEffect(() => {
    document.title = `${isDirty ? '• ' : ''}${name} — ${APP_NAME}`
  }, [name, isDirty])
}
