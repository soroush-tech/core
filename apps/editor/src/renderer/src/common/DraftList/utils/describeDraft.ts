import { isNewGist, type GistDraft } from '../../../../../shared/ipc'

export interface DraftRow {
  gistId: string
  /** What to call it: the description if there is one, else the files it touches. */
  title: string
  changeCount: number
}

/**
 * Names a draft so it can be recognised.
 *
 * A staged description wins, since it is what the gist is about to be called.
 * Otherwise the gist's published description, and only failing both the staged
 * filenames - which still say more about unfinished work than an id does.
 */
export function describeDraft(
  gistId: string,
  draft: GistDraft,
  publishedDescription?: string | null
): DraftRow {
  const filenames = Object.keys(draft.files)
  const changeCount = filenames.length + (draft.description === undefined ? 0 : 1)

  const named = draft.description?.trim() || publishedDescription?.trim() || filenames.join(', ')
  const title = named || 'Untitled'

  return {
    gistId,
    title: isNewGist(gistId) ? `New gist - ${title}` : title,
    changeCount,
  }
}
