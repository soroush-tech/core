import { useState } from 'react'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { LinearProgress } from '@soroush.tech/design-system/LinearProgress'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import { useClaudeEdit } from '../../hooks/useClaudeEdit'

const PREVIEW_LIMIT = 120

/** Said when the answer came back to a document that had moved on without it. */
const STALE_MESSAGE = 'The document changed while Claude was working — the edit was not applied.'

export interface ClaudePanelProps {
  /** The text Claude rewrites — the selection, or the whole document when nothing is selected. */
  targetText: string
  /** True when `targetText` is a selection rather than the whole document. */
  isSelection: boolean
  /**
   * Called as a request starts, so the caller can remember what was asked
   * about — the selection may move before the answer arrives.
   */
  onStart?: () => void
  /**
   * Receives the rewritten text to apply over the target. Returns false when
   * the document moved on while Claude worked and it could not be applied.
   */
  onApply: (rewritten: string) => boolean
}

/** Side panel: shows what Claude will edit, takes an instruction, asks Claude. */
export function ClaudePanel({
  targetText,
  isSelection,
  onStart,
  onApply,
}: Readonly<ClaudePanelProps>) {
  const [instruction, setInstruction] = useState('')
  const [isStale, setIsStale] = useState(false)
  const { editSelection, isLoading, error } = useClaudeEdit()
  const canSubmit = instruction.trim() !== '' && !isLoading
  const message = error ?? (isStale ? STALE_MESSAGE : null)

  const preview =
    targetText.length > PREVIEW_LIMIT ? `${targetText.slice(0, PREVIEW_LIMIT)}…` : targetText

  const submit = async () => {
    onStart?.()
    setIsStale(false)
    const rewritten = await editSelection(targetText, instruction)
    if (rewritten === null) return
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
        <Typography variant="caption" color="secondary" m={0}>
          {isSelection
            ? `Selection · ${targetText.length} characters`
            : 'No selection — Claude edits the whole document.'}
        </Typography>
        {isSelection && (
          <Typography variant="body2" m={0}>
            {preview}
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
        <Flex flexDirection="column" flex={1}>
          <TextInput
            multiline
            fullWidth
            minRows={2}
            value={instruction}
            placeholder="Describe the change…"
            onChange={(event) => setInstruction(event.target.value)}
            inputProps={{ 'aria-label': 'Edit instruction' }}
          />
        </Flex>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          disabled={!canSubmit}
          onClick={() => void submit()}
        >
          Ask Claude
        </Button>
      </Flex>
    </Flex>
  )
}
