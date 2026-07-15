import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Flex } from '../../Flex'
import { FormControl } from '../../FormControl'
import { FormLabel } from '../../FormLabel'
import { TextInput } from '../../TextInput'
import { Editor } from '../Editor'
import { Preview } from '../Preview'
import { Toolbar } from '../Toolbar'
import { Control } from './Control'

const SAMPLE = '# Compose the parts\n\n`Control` is headless — it wires the parts together.\n'

// Control renders no UI on its own; the meaningful demo is the composed compound.
function Composition() {
  const [value, setValue] = useState(SAMPLE)
  return (
    <Control value={value} onChange={setValue}>
      <Flex flexDirection="column" gap={2} width="100%">
        <Toolbar />
        <Flex flexDirection={['column', 'column', 'row']} gap={2} alignItems="stretch">
          <Editor minRows={10} />
          <Flex flex={1} minWidth={0} bg="terminal" borderRadius="md" p={3} overflow="auto">
            <Preview>{value}</Preview>
          </Flex>
        </Flex>
      </Flex>
    </Control>
  )
}

const meta: Meta<typeof Control> = {
  title: 'Theme/Markdown/Control',
  component: Control,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: [] },
  },
  render: () => <Composition />,
}

export default meta
type Story = StoryObj<typeof Control>

export const Default: Story = {}

// A form: a title field on top, then the markdown editor as a named field. FormControl auto-wires
// each label to its control; the Editor's `name` makes the body part of native form submission.
function ArticleForm() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('# Body\n\nWrite the article here.\n')
  return (
    <Flex as="form" flexDirection="column" gap={3} width="100%">
      <FormControl fullWidth>
        <FormLabel>Title</FormLabel>
        <TextInput
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Article title"
          variant="outlined"
          fullWidth
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel>Markdown</FormLabel>
        <Control value={body} onChange={setBody}>
          <Flex flexDirection="column" gap={2}>
            <Toolbar />
            <Editor name="body" minRows={8} variant="outlined" />
          </Flex>
        </Control>
      </FormControl>
    </Flex>
  )
}

export const WithForm: Story = {
  render: () => <ArticleForm />,
}
