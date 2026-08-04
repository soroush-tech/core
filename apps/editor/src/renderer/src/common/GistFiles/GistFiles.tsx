import { useState, type KeyboardEvent } from 'react'
import { styled } from '@soroush.tech/design-system'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { LinearProgress } from '@soroush.tech/design-system/LinearProgress'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import type { GistOrigin } from '../../../../shared/ipc'
import { countChanges, useGistDraft } from '../../hooks/useGistDraft'
import { useGistFiles } from '../../hooks/useGistFiles'
import { DescriptionField } from './DescriptionField'
import { mergeDraft, type DraftedFile } from './utils/mergeDraft'

export interface GistFilesProps {
  /** The gist whose files are shown, or null when none has been selected yet. */
  gistId: string | null
  /** The gist's published description, or null when it has none. */
  gistDescription: string | null
  /** Loads a file into the document for editing, tagged with where it came from. */
  onOpenFile: (content: string, origin: GistOrigin) => void
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
export function GistFiles({ gistId, gistDescription, onOpenFile }: Readonly<GistFilesProps>) {
  const { files, error, isLoading, reload } = useGistFiles(gistId)
  const { draft, error: draftError, stage, stageDescription, reset, publish } = useGistDraft(gistId)
  const [filename, setFilename] = useState('')

  const merged = mergeDraft(files, draft.files)
  const changeCount = countChanges(draft)

  // The staged description wins while it exists; otherwise the published one.
  const published = gistDescription ?? ''
  const description = draft.description ?? published

  const applyDescription = (id: string, next: string) => {
    if (next === description) return
    // Typing the published description back is not a change worth publishing.
    void stageDescription(id, next === published ? null : next)
  }

  // Both entry points are gated on `canAdd`, which already rejects a duplicate.
  const addFile = async (id: string) => {
    const name = filename.trim()
    if (await stage(id, name, { status: 'added', content: '' })) {
      setFilename('')
      onOpenFile('', { gistId: id, filename: name })
    }
  }

  // The ✕ toggles: a staged file is unstaged, a published one is marked deleted.
  const toggleDelete = (id: string, file: DraftedFile) =>
    void stage(id, file.filename, file.status === null ? { status: 'deleted' } : null)

  const publishDraft = async (id: string) => {
    await publish(id)
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
        Files
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
              <Icon name={file.status === null ? 'close' : 'refresh'} size="1rem" />
            </Pressable>
          </FileRow>
        ))}

      {gistId !== null && (
        <Flex flexDirection="row" alignItems="center" gap={2}>
          <TextInput
            size="sm"
            fullWidth
            value={filename}
            placeholder="new-file.md"
            onChange={(event) => setFilename(event.target.value)}
            inputProps={{
              'aria-label': 'New filename',
              onKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                if (event.key !== 'Enter' || !canAdd) return
                event.preventDefault()
                void addFile(gistId)
              },
            }}
          />
          <Button
            type="button"
            variant="outlined"
            size="sm"
            disabled={!canAdd}
            onClick={() => void addFile(gistId)}
          >
            Add file
          </Button>
        </Flex>
      )}

      {gistId !== null && changeCount > 0 && (
        <Flex flexDirection="column" gap={2}>
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
              Publish
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
