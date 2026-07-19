import type { EditorAPI } from './index'

declare global {
  interface Window {
    editorAPI: EditorAPI
  }
}

export {}
