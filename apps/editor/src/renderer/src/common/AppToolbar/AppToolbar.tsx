import { Button } from '@soroush.tech/design-system/Button'
import { ButtonGroup } from '@soroush.tech/design-system/ButtonGroup'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'

export interface AppToolbarProps {
  filePath: string | null
  isDirty: boolean
  canUndo: boolean
  canRedo: boolean
  onNew: () => void
  onOpen: () => void
  onSave: () => void
  onSaveAs: () => void
  onUndo: () => void
  onRedo: () => void
}

/** File actions, undo/redo, and the current document's path with dirty indicator. */
export function AppToolbar({
  filePath,
  isDirty,
  canUndo,
  canRedo,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onUndo,
  onRedo,
}: Readonly<AppToolbarProps>) {
  return (
    <Flex flexDirection="row" alignItems="center" gap={2} flexWrap="wrap">
      <ButtonGroup borderRadius="sq" size="sm" variant="outlined">
        <Button type="button" onClick={onNew}>
          New
        </Button>
        <Button type="button" onClick={onOpen}>
          Open
        </Button>
        <Button type="button" onClick={onSave}>
          Save
        </Button>
        <Button type="button" onClick={onSaveAs}>
          Save As
        </Button>
      </ButtonGroup>
      <ButtonGroup borderRadius="sq" size="sm" variant="outlined">
        <Button type="button" disabled={!canUndo} onClick={onUndo}>
          Undo
        </Button>
        <Button type="button" disabled={!canRedo} onClick={onRedo}>
          Redo
        </Button>
      </ButtonGroup>
      <Typography variant="body2" color="secondary" m={0}>
        {filePath ?? 'Untitled'}
        {isDirty ? ' •' : ''}
      </Typography>
    </Flex>
  )
}
