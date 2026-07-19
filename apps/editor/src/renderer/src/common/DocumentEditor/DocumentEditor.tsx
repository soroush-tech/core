import { Flex } from '@soroush.tech/design-system/Flex'
import { Control, Editor, Preview, Toolbar } from '@soroush.tech/markdown'

export interface DocumentEditorProps {
  value: string
  onChange: (value: string) => void
}

/** The markdown editing surface: formatting toolbar, source editor, and live preview. */
export function DocumentEditor({ value, onChange }: Readonly<DocumentEditorProps>) {
  return (
    <Control value={value} onChange={onChange}>
      <Flex flexDirection="column" gap={2} flex={1} minHeight={0}>
        <Toolbar />
        <Flex flexDirection="row" gap={3} flex={1} minHeight={0}>
          <Editor minRows={24} />
          <Flex flexDirection="column" flex={1} minWidth={0} overflow="auto">
            <Preview>{value}</Preview>
          </Flex>
        </Flex>
      </Flex>
    </Control>
  )
}
