import { useState } from 'react'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Typography } from '@soroush.tech/design-system/Typography'

export interface DescriptionFieldProps {
  gistId: string
  /** The description to show: the staged one if there is one, else the published one. */
  value: string
  /** Whether `value` is a local edit rather than what GitHub has. */
  isStaged: boolean
  /** Called with the typed description once the user commits it. */
  onApply: (gistId: string, description: string) => void
}

/**
 * The gist's description: read-only until Edit is pressed, then a multiline
 * field with explicit Save and Cancel — a description can run to several
 * lines, so Enter belongs to the text rather than to submitting.
 *
 * Saving stages it, so it joins the other unpublished changes rather than
 * being written to GitHub on its own.
 */
export function DescriptionField({
  gistId,
  value,
  isStaged,
  onApply,
}: Readonly<DescriptionFieldProps>) {
  const [typed, setTyped] = useState(value)
  const [synced, setSynced] = useState({ gistId, value })
  const [isEditing, setIsEditing] = useState(false)

  // Follow the gist: selecting another one, or resetting the draft, replaces
  // what is in the field and closes the editor. Adjusted during render rather
  // than in an effect, so it never paints the previous gist's description.
  if (synced.gistId !== gistId || synced.value !== value) {
    setSynced({ gistId, value })
    setTyped(value)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <Flex flexDirection="column" gap={1}>
        <Flex flexDirection="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Typography variant="caption" color="secondary" m={0}>
            {value || 'No description'}
          </Typography>
          <Button
            type="button"
            variant="text"
            size="sm"
            aria-label="Edit description"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </Flex>
        {isStaged && (
          <Typography variant="caption" color="secondary" m={0}>
            Description edited — publish to apply it.
          </Typography>
        )}
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={1}>
      <TextInput
        multiline
        minRows={2}
        fullWidth
        value={typed}
        placeholder="Describe this gist…"
        onChange={(event) => setTyped(event.target.value)}
        inputProps={{ 'aria-label': 'Gist description' }}
      />
      <Flex flexDirection="row" gap={2}>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={() => {
            onApply(gistId, typed)
            setIsEditing(false)
          }}
        >
          Save description
        </Button>
        <Button
          type="button"
          variant="text"
          size="sm"
          onClick={() => {
            setTyped(value)
            setIsEditing(false)
          }}
        >
          Cancel
        </Button>
      </Flex>
    </Flex>
  )
}
