import { Button } from '@soroush.tech/design-system/Button'
import { ButtonGroup } from '@soroush.tech/design-system/ButtonGroup'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'

export interface AppToolbarProps {
  filePath: string | null
  isDirty: boolean
  onNew: () => void
  onOpen: () => void
  onSave: () => void
  onSaveAs: () => void
}

/** File actions plus the current document's path and dirty indicator. */
export function AppToolbar({
  filePath,
  isDirty,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
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
      <Typography variant="body2" color="secondary" m={0}>
        {filePath ?? 'Untitled'}
        {isDirty ? ' •' : ''}
      </Typography>
    </Flex>
  )
}
