import { useState } from 'react'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { LinearProgress } from '@soroush.tech/design-system/LinearProgress'
import { NativeSelect } from '@soroush.tech/design-system/NativeSelect'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import { useClaudeEdit } from '../../hooks/useClaudeEdit'
import { useGistFiles } from '../../hooks/useGistFiles'
import { useGists } from '../../hooks/useGists'
import { isGistDrag, readGistDrag } from '../../utils/gistDrag'
import { CONTEXT_LIMIT, toContext } from './utils/toContext'
import { toPreview } from './utils/toPreview'

/** No gist referenced. Empty rather than null, so it doubles as "not set". */
const NO_REFERENCE = ''

/** Said when the answer came back to a document that had moved on without it. */
const STALE_MESSAGE = 'The document changed while Claude was working — the edit was not applied.'

export interface ClaudePanelProps {
  /** The text Claude rewrites — the selection, or the whole document when nothing is selected. */
  targetText: string
  /** True when `targetText` is a selection rather than the whole document. */
  isSelection: boolean
  /** What the open document is called, to name what a whole-document edit will rewrite. */
  documentName: string
  /**
   * Called as a request starts, so the caller can remember what was asked
   * about — the selection may move before the answer arrives.
   */
  onStart?: () => void
  /**
   * Receives the answer so far, to write over the target. Returns false when
   * the document moved on while Claude worked and it could not be applied.
   */
  onApply: (rewritten: string) => boolean
}

/** Side panel: shows what Claude will edit, takes an instruction, asks Claude. */
export function ClaudePanel({
  targetText,
  isSelection,
  documentName,
  onStart,
  onApply,
}: Readonly<ClaudePanelProps>) {
  const [instruction, setInstruction] = useState('')
  const [isStale, setIsStale] = useState(false)
  // An existing gist to write from — "we covered rehydration, now do the part
  // about data fetching". Its files are fetched as soon as it is chosen.
  const [referenceId, setReferenceId] = useState(NO_REFERENCE)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const { files, description, error: referenceError } = useGistFiles(referenceId || null)
  // The same choice the drag makes, for anyone not making it with a mouse.
  // Dropped when the account has no gists to offer — which is also what a
  // signed-out account looks like from here, and neither needs saying twice.
  const { gists } = useGists()

  // Every delta goes straight into the document, so the answer is watched
  // being written where it will live rather than in a box beside it. A delta
  // the document has no room for is dropped by the caller, and the run carries
  // on — what it writes next is judged against the document as it then is.
  const { editSelection, cancel, isLoading, error } = useClaudeEdit({ onText: onApply })
  const canSubmit = instruction.trim() !== '' && !isLoading
  const message = error ?? (isStale ? STALE_MESSAGE : null)

  const preview = toPreview(targetText)

  const reference = referenceId === NO_REFERENCE ? null : toContext(description, files)
  // What the dropped gist is called: its description, else its first file —
  // the drag carries only an id, so the name comes from what was fetched.
  // `||`, not `??`: a description of nothing but spaces is no name either, and
  // an empty one would leave the button to stop referring to it unlabelled.
  const referenceName = description?.trim() || files[0]?.filename || 'that gist'

  const submit = async () => {
    onStart?.()
    setIsStale(false)
    // What was there before the streaming overwrote it, to put back if the run
    // is stopped or fails — a half-written answer is not something to leave behind.
    const before = targetText
    const rewritten = await editSelection(targetText, instruction, reference?.text ?? null)
    if (rewritten === null) {
      onApply(before)
      return
    }
    // The instruction is kept when the answer could not be applied, so asking
    // again is one click rather than typing it out a second time.
    if (!onApply(rewritten)) return setIsStale(true)
    setInstruction('')
  }

  return (
    <Flex
      role="complementary"
      aria-label="Claude assistant"
      flexDirection="column"
      gap={2}
      flexShrink={0}
    >
      <Flex flexDirection="row" alignItems="baseline" gap={2} flexWrap="wrap">
        <Typography variant="h6" m={0}>
          Edit with Claude
        </Typography>
        {/* What is about to be rewritten: the selection, or the whole file by
            name — with a taste of it either way. */}
        <Typography variant="caption" color="secondary" m={0}>
          {isSelection ? 'Selection' : documentName} ·{' '}
          {targetText.length === 0 ? 'empty' : `${targetText.length} characters`}
        </Typography>
        {preview !== '' && (
          <Typography variant="body2" m={0}>
            {preview}
          </Typography>
        )}
        {/* The keyboard's way to the same thing the drag does. Shown only while
            there is something to choose, so an account with no gists — or none
            connected — is not offered an empty list. */}
        {gists.length > 0 && (
          <NativeSelect
            size="sm"
            variant="text"
            placeholder="Write from a gist…"
            value={referenceId}
            onChange={(value) => setReferenceId(String(value))}
            selectProps={{ 'aria-label': 'Gist to write from' }}
            options={gists.map((gist) => ({
              // A gist need not be described, and the summary carries no
              // filenames to fall back on — only how many there are.
              label:
                gist.description?.trim() ||
                `Untitled · ${gist.fileCount === 1 ? '1 file' : `${String(gist.fileCount)} files`}`,
              value: gist.id,
            }))}
          />
        )}
        {/* On the heading's own line, so referring to a gist costs no space. */}
        {reference && (
          <Flex flexDirection="row" alignItems="center" gap={1}>
            <Typography variant="caption" color="secondary" m={0}>
              {reference.isTrimmed
                ? `Writing from ${referenceName} · first ${CONTEXT_LIMIT.toLocaleString()} characters`
                : `Writing from ${referenceName}`}
            </Typography>
            <Pressable
              as="button"
              type="button"
              feedback="highlight"
              p={0}
              aria-label={`Stop writing from ${referenceName}`}
              onClick={() => setReferenceId(NO_REFERENCE)}
            >
              <Icon name="close" size="0.875rem" />
            </Pressable>
          </Flex>
        )}
        {referenceError && (
          <Typography role="alert" variant="caption" color="error" m={0}>
            {referenceError}
          </Typography>
        )}
      </Flex>

      <Flex flexDirection="row" alignItems="flex-start" gap={2}>
        {message && (
          <Typography role="alert" color="error" m={0}>
            {message}
          </Typography>
        )}
        {isLoading && <LinearProgress />}
        {/* Drop a gist from the Gists panel here to write from it — the
            placeholder is the only thing that changes, so nothing takes room
            for a reference that is usually absent. */}
        <Flex
          flexDirection="column"
          flex={1}
          onDragOver={(event) => {
            if (!isGistDrag(event.dataTransfer)) return
            // Without this the browser refuses the drop.
            event.preventDefault()
            setIsDropTarget(true)
          }}
          onDragLeave={() => setIsDropTarget(false)}
          onDrop={(event) => {
            setIsDropTarget(false)
            if (!isGistDrag(event.dataTransfer)) return
            event.preventDefault()
            const dropped = readGistDrag(event.dataTransfer)
            if (dropped !== null) setReferenceId(dropped)
          }}
        >
          <TextInput
            multiline
            fullWidth
            minRows={2}
            value={instruction}
            placeholder={isDropTarget ? 'Drop to write from this gist' : 'Describe the change…'}
            onChange={(event) => setInstruction(event.target.value)}
            inputProps={{ 'aria-label': 'Edit instruction' }}
          />
        </Flex>
        {isLoading ? (
          <Button type="button" variant="text" size="sm" onClick={() => void cancel()}>
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            variant="outlined"
            size="sm"
            disabled={!canSubmit}
            onClick={() => void submit()}
          >
            Ask Claude
          </Button>
        )}
      </Flex>
    </Flex>
  )
}
