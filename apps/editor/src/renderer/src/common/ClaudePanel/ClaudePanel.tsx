import { useState } from 'react'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { LinearProgress } from '@soroush.tech/design-system/LinearProgress'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import { useClaudeEdit } from '../../hooks/useClaudeEdit'

const PREVIEW_LIMIT = 120

export interface ClaudePanelProps {
  /** The text currently selected in the editor — empty when nothing is selected. */
  selectedText: string
  /** Receives the rewritten text to splice back over the selection. */
  onApply: (rewritten: string) => void
}

/** Side panel: shows the current selection, takes an instruction, asks Claude. */
export function ClaudePanel({ selectedText, onApply }: Readonly<ClaudePanelProps>) {
  const [instruction, setInstruction] = useState('')
  const { editSelection, isLoading, error } = useClaudeEdit()
  const canSubmit = selectedText !== '' && instruction.trim() !== '' && !isLoading

  const preview =
    selectedText.length > PREVIEW_LIMIT ? `${selectedText.slice(0, PREVIEW_LIMIT)}…` : selectedText

  const submit = async () => {
    const rewritten = await editSelection(selectedText, instruction)
    if (rewritten === null) return
    onApply(rewritten)
    setInstruction('')
  }

  return (
    <Flex
      role="complementary"
      aria-label="Claude assistant"
      flexDirection="column"
      gap={2}
      width="20rem"
      flexShrink={0}
    >
      <Typography variant="h6" m={0}>
        Edit with Claude
      </Typography>
      <Typography variant="caption" color="secondary" m={0}>
        {selectedText === ''
          ? 'Select text in the editor, then describe the change.'
          : `Selection · ${selectedText.length} characters`}
      </Typography>
      {selectedText !== '' && (
        <Typography variant="body2" m={0}>
          {preview}
        </Typography>
      )}
      <TextInput
        multiline
        fullWidth
        minRows={3}
        value={instruction}
        placeholder="Describe the change…"
        onChange={(event) => setInstruction(event.target.value)}
        inputProps={{ 'aria-label': 'Edit instruction' }}
      />
      <Button
        type="button"
        variant="outlined"
        size="sm"
        disabled={!canSubmit}
        onClick={() => void submit()}
      >
        Ask Claude
      </Button>
      {isLoading && <LinearProgress />}
      {error && (
        <Typography role="alert" color="error" m={0}>
          {error}
        </Typography>
      )}
    </Flex>
  )
}
