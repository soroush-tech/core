import { useState, type KeyboardEvent } from 'react'
import { styled } from '@soroush.tech/design-system'
import { Button } from '@soroush.tech/design-system/Button'
import { Checkbox } from '@soroush.tech/design-system/Checkbox'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { LinearProgress } from '@soroush.tech/design-system/LinearProgress'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import { isNewGist, type GistOrigin } from '../../../../shared/ipc'
import { PenMark } from '../../assets/PenMark'
import { TrashMark } from '../../assets/TrashMark'
import { countChanges, useGistDraft } from '../../hooks/useGistDraft'
import { useGistFiles } from '../../hooks/useGistFiles'
import { DescriptionField } from './DescriptionField'
import { mergeDraft, type DraftedFile } from './utils/mergeDraft'

export interface GistFilesProps {
  /** The gist whose files are shown, or null when none has been selected yet. */
  gistId: string | null
  /** Loads a file into the document for editing, tagged with where it came from. */
  onOpenFile: (content: string, origin: GistOrigin) => void
  /** Called once a draft reaches GitHub, so the rail can leave the sandbox behind. */
  onPublished?: (gistId: string) => void
  /** Called after a rename, so a document open on that file follows the new name. */
  onRenamed?: (gistId: string, from: string, to: string) => void
}

/** Single letter shown against a changed file, the way a diff would mark it. */
const STATUS_LETTER = { added: 'A', modified: 'M', deleted: 'D' } as const

/**
 * Delete stays out of the way until the row is hovered — but `opacity`, not
 * `display`, so it keeps its place in the tab order and `:focus-within` brings
 * it back for keyboard users.
 */
const FileRow = styled(Flex)`
  & [data-file-action] {
    opacity: 0;
  }
  &:hover [data-file-action],
  &:focus-within [data-file-action] {
    opacity: 1;
  }
`

/**
 * The selected gist's files as a local working copy. Adding, editing and
 * deleting are staged in the sandbox; Publish sends the lot to GitHub in one
 * request and Reset throws it away.
 */
export function GistFiles({
  gistId,
  onOpenFile,
  onPublished,
  onRenamed,
}: Readonly<GistFilesProps>) {
  const {
    files,
    description: publishedDescription,
    error,
    isLoading,
    reload,
  } = useGistFiles(gistId)
  const {
    draft,
    error: draftError,
    stage,
    renameFile: rename,
    stageDescription,
    reset,
    publish,
  } = useGistDraft(gistId)
  const [filename, setFilename] = useState('')
  // The name field only exists while a file is being added, the way the
  // description and a rename only show a field once asked for.
  const [isAdding, setIsAdding] = useState(false)
  // The file being renamed, and what it is being renamed to.
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renamedTo, setRenamedTo] = useState('')
  // Secret by default: publishing someone's notes to the world by accident is
  // not a mistake they can take back.
  const [isPublic, setIsPublic] = useState(false)

  const isNew = gistId !== null && isNewGist(gistId)

  const merged = mergeDraft(files, draft.files)
  const changeCount = countChanges(draft)

  // The staged description wins while it exists; otherwise the published one.
  const published = publishedDescription ?? ''
  const description = draft.description ?? published

  const applyDescription = (id: string, next: string) => {
    if (next === description) return
    // Typing the published description back is not a change worth publishing.
    void stageDescription(id, next === published ? null : next)
  }

  // Gated on `canAdd`, which already rejects a blank or duplicate name.
  const addFile = async (id: string) => {
    const name = filename.trim()
    if (await stage(id, name, { status: 'added', content: '' })) {
      setFilename('')
      setIsAdding(false)
      onOpenFile('', { gistId: id, filename: name })
    }
  }

  const cancelAdd = () => {
    setFilename('')
    setIsAdding(false)
  }

  // The row action toggles: a staged file is unstaged, a published one is marked deleted.
  const toggleDelete = (id: string, file: DraftedFile) =>
    void stage(id, file.filename, file.status === null ? { status: 'deleted' } : null)

  /**
   * Renames through one draft change: staging the deletion and the new name
   * separately could leave the file gone with nothing in its place, and what is
   * staged exists nowhere else. The document follows only once it has stuck.
   */
  const renameFile = async (id: string, file: DraftedFile) => {
    const name = renamedTo.trim()
    setRenaming(null)
    if (name === '' || name === file.filename) return
    if (merged.some((other) => other.filename === name)) return

    if (await rename(id, file.filename, name, file.content)) onRenamed?.(id, file.filename, name)
  }

  const startRename = (filename: string) => {
    setRenaming(filename)
    setRenamedTo(filename)
  }

  const publishDraft = async (id: string) => {
    if (await publish(id, isPublic)) onPublished?.(id)
    reload()
  }

  const resetDraft = async (id: string) => {
    await reset(id)
    reload()
  }

  const isDuplicate = merged.some((file) => file.filename === filename.trim())
  const canAdd = filename.trim() !== '' && !isDuplicate

  return (
    <Flex flexDirection="column" gap={2} p={3} minHeight={0} overflow="auto">
      <Typography variant="h6" m={0}>
        {isNew ? 'New gist' : 'Files'}
      </Typography>

      {gistId === null && (
        <Typography variant="caption" color="secondary" m={0}>
          Select a gist to see its files.
        </Typography>
      )}

      {gistId !== null && (
        <DescriptionField
          gistId={gistId}
          value={description}
          isStaged={draft.description !== undefined}
          onApply={applyDescription}
        />
      )}

      {isLoading && <LinearProgress />}

      {(error ?? draftError) && (
        <Typography role="alert" variant="caption" color="error" m={0}>
          {error ?? draftError}
        </Typography>
      )}

      {gistId !== null &&
        merged.map((file) => (
          <FileRow
            key={file.filename}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            {renaming === file.filename ? (
              <TextInput
                size="sm"
                fullWidth
                value={renamedTo}
                onChange={(event) => setRenamedTo(event.target.value)}
                inputProps={{
                  'aria-label': `Rename ${file.filename}`,
                  autoFocus: true,
                  // Escape abandons it; clicking away does too, so a rename is
                  // never applied by accident.
                  onBlur: () => setRenaming(null),
                  onKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    if (event.key === 'Escape') return setRenaming(null)
                    if (event.key !== 'Enter') return
                    event.preventDefault()
                    void renameFile(gistId, file)
                  },
                }}
              />
            ) : (
              <>
                <Pressable
                  as="button"
                  type="button"
                  feedback="highlight"
                  p={1}
                  // Named explicitly: the status letter is decorative, and letting it
                  // into the name would read as "notes.md notes.md is modified".
                  aria-label={file.status ? `${file.filename} — ${file.status}` : file.filename}
                  onClick={() => onOpenFile(file.content, { gistId, filename: file.filename })}
                >
                  <Flex flexDirection="row" alignItems="center" gap={2}>
                    <Icon name="code" size="1rem" />
                    <Typography variant="body2" m={0}>
                      {file.filename}
                    </Typography>
                    {file.status && (
                      <Typography aria-hidden variant="caption" color="secondary" m={0}>
                        {STATUS_LETTER[file.status]}
                      </Typography>
                    )}
                  </Flex>
                </Pressable>
                <Flex flexDirection="row" alignItems="center" gap={1}>
                  {/* A file staged for deletion has no name worth changing. */}
                  {file.status !== 'deleted' && (
                    <Pressable
                      as="button"
                      type="button"
                      data-file-action
                      feedback="highlight"
                      p={1}
                      aria-label={`Rename ${file.filename}`}
                      onClick={() => startRename(file.filename)}
                    >
                      <PenMark />
                    </Pressable>
                  )}
                  <Pressable
                    as="button"
                    type="button"
                    data-file-action
                    feedback="highlight"
                    p={1}
                    aria-label={
                      file.status === null ? `Delete ${file.filename}` : `Undo ${file.filename}`
                    }
                    onClick={() => toggleDelete(gistId, file)}
                  >
                    {/* Undo is a different act from deleting, so it keeps its own icon. */}
                    {file.status === null ? <TrashMark /> : <Icon name="refresh" size="1rem" />}
                  </Pressable>
                </Flex>
              </>
            )}
          </FileRow>
        ))}

      {gistId !== null &&
        (isAdding ? (
          <TextInput
            size="sm"
            fullWidth
            value={filename}
            placeholder="new-file.md"
            onChange={(event) => setFilename(event.target.value)}
            inputProps={{
              'aria-label': 'New filename',
              autoFocus: true,
              // Same bargain as a rename: Enter commits, Escape or clicking
              // away abandons it.
              onBlur: cancelAdd,
              onKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                if (event.key === 'Escape') return cancelAdd()
                if (event.key !== 'Enter' || !canAdd) return
                event.preventDefault()
                void addFile(gistId)
              },
            }}
          />
        ) : (
          <Button
            type="button"
            variant="outlined"
            size="sm"
            fullWidth
            onClick={() => setIsAdding(true)}
          >
            Add file
          </Button>
        ))}

      {gistId !== null && changeCount > 0 && (
        <Flex flexDirection="column" gap={2}>
          {/* Secret unless asked for: creating a public gist cannot be undone
              by making it secret afterwards. */}
          {isNew && (
            <Checkbox
              checked={isPublic}
              size="sm"
              aria-label="Public gist"
              onChange={(event) => setIsPublic(event.target.checked)}
            >
              Public gist
            </Checkbox>
          )}
          <Typography variant="caption" color="secondary" m={0}>
            {changeCount === 1
              ? '1 unpublished change'
              : `${String(changeCount)} unpublished changes`}
          </Typography>

          <Flex flexDirection="row" gap={2}>
            <Button
              type="button"
              variant="contained"
              size="sm"
              onClick={() => void publishDraft(gistId)}
            >
              {isNew ? 'Create gist' : 'Publish'}
            </Button>
            <Button type="button" variant="text" size="sm" onClick={() => void resetDraft(gistId)}>
              Reset
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
