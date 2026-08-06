import type { GistSummary } from '../../../../../shared/ipc'

/**
 * What a gist goes by in the picker: its description, or the first file in it
 * when it has none — which is how GitHub titles an undescribed gist too, so a
 * gist is called here what it is called there. A description of nothing but
 * spaces is no name either, and would leave the row blank.
 */
export function toGistLabel({ description, filename }: GistSummary): string {
  return description?.trim() || filename || 'Untitled gist'
}
