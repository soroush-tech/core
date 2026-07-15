import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { modalScrollTokens } from '../utils/test/storiesOptions'
import { Button } from '../Button'
import { Paper } from '../Paper'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { TextInput } from '../TextInput'
import { Modal } from './Modal'

const meta: Meta<typeof Modal> = {
  title: 'Theme/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      include: [
        'scroll',
        'hasBackdrop',
        'shouldUsePortal',
        'shouldKeepMounted',
        'shouldLockScroll',
        'shouldAutoFocus',
        'shouldTrapFocus',
        'shouldEnforceFocus',
        'shouldRestoreFocus',
      ],
    },
  },
  argTypes: {
    scroll: {
      control: { type: 'inline-radio' },
      options: modalScrollTokens,
      description:
        'Whether long content scrolls within the surface (paper) or the whole root (body).',
      table: { category: 'Layout', defaultValue: { summary: 'paper' } },
    },
    hasBackdrop: {
      control: 'boolean',
      description: 'Render the dimmed backdrop behind the content.',
      table: { category: 'Visual', defaultValue: { summary: 'true' } },
    },
    shouldUsePortal: {
      control: 'boolean',
      description: 'Portal the modal into the document body.',
      table: { category: 'Visual', defaultValue: { summary: 'true' } },
    },
    shouldKeepMounted: {
      control: 'boolean',
      description: 'Keep the children mounted while the modal is closed.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    shouldLockScroll: {
      control: 'boolean',
      description: 'Lock body scroll while the modal is open.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    shouldAutoFocus: {
      control: 'boolean',
      description: 'Move focus into the modal on open.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
    shouldTrapFocus: {
      control: 'boolean',
      description: 'Trap Tab focus within the modal.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
    shouldEnforceFocus: {
      control: 'boolean',
      description: 'Pull focus back into the modal whenever it escapes.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
    shouldRestoreFocus: {
      control: 'boolean',
      description: 'Restore focus to the trigger on close.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof Modal>
type ModalArgs = Partial<ComponentProps<typeof Modal>>

const DefaultDemo = (args: ModalArgs) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Paper role="dialog" aria-modal="true" aria-label="Example dialog" p={4} width="320px">
          <Flex flexDirection="column" gap={3}>
            <Typography variant="h5" m={0}>
              Modal title
            </Typography>
            <Typography variant="body2" color="secondary" m={0}>
              Press Escape, click the backdrop, or use the button to close.
            </Typography>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </Flex>
        </Paper>
      </Modal>
    </>
  )
}

export const Default: Story = {
  args: {
    scroll: 'paper',
    hasBackdrop: true,
    shouldUsePortal: true,
    shouldKeepMounted: false,
    shouldLockScroll: true,
    shouldAutoFocus: true,
    shouldTrapFocus: true,
    shouldEnforceFocus: true,
    shouldRestoreFocus: true,
  },
  render: (args) => <DefaultDemo {...args} />,
}

const NestedDemo = (args: ModalArgs) => {
  const [isOuterOpen, setIsOuterOpen] = useState(false)
  const [isInnerOpen, setIsInnerOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setIsOuterOpen(true)}>Open modal</Button>
      <Modal {...args} isOpen={isInnerOpen} onClose={() => setIsInnerOpen(false)}>
        <Paper role="dialog" aria-modal="true" aria-label="Nested dialog" p={4} width="300px">
          <Flex flexDirection="column" gap={3}>
            <Typography variant="h5" m={0}>
              Nested modal
            </Typography>
            <Typography variant="body2" color="secondary" m={0}>
              Layered above the outer modal, with its own backdrop and focus trap.
            </Typography>
            <Button onClick={() => setIsInnerOpen(false)}>Close</Button>
          </Flex>
        </Paper>
      </Modal>
      <Modal {...args} isOpen={isOuterOpen} onClose={() => setIsOuterOpen(false)}>
        <Paper
          role="dialog"
          aria-modal="true"
          aria-label="Outer dialog"
          p={4}
          width="360px"
          borderRadius="lg"
        >
          <Flex flexDirection="column" gap={3}>
            <Typography variant="h5" m={0}>
              Outer modal
            </Typography>
            <Typography variant="body2" color="secondary" m={0}>
              Open a second modal on top. The manager stacks it above and Escape closes the top one
              first.
            </Typography>
            <Button onClick={() => setIsInnerOpen(true)}>Open nested modal</Button>
            <Button onClick={() => setIsOuterOpen(false)}>Close</Button>
          </Flex>
        </Paper>
      </Modal>
    </>
  )
}

export const Nested: Story = {
  args: {
    scroll: 'paper',
    hasBackdrop: true,
    shouldUsePortal: true,
    shouldKeepMounted: false,
    shouldLockScroll: true,
    shouldAutoFocus: true,
    shouldTrapFocus: true,
    shouldEnforceFocus: true,
    shouldRestoreFocus: true,
  },
  render: (args) => <NestedDemo {...args} />,
}

const ScrollPaperDemo = (args: ModalArgs) => {
  const [isOpen, setIsOpen] = useState(false)
  const backgroundLines = Array.from({ length: 30 }, (_, i) => `Background line ${i + 1}`)
  const paragraphs = Array.from({ length: 20 }, (_, i) => `Paragraph ${i + 1}`)
  return (
    <>
      <Flex flexDirection="column" gap={2}>
        <Button onClick={() => setIsOpen(true)}>Open modal</Button>
        {/* Tall filler so the page scrolls; opening the modal locks body scroll. */}
        {backgroundLines.map((line) => (
          <Typography key={line} variant="body2" color="secondary" m={0}>
            {line} — background scroll is locked while the modal is open.
          </Typography>
        ))}
      </Flex>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Paper
          role="dialog"
          aria-modal="true"
          aria-label="Paper-scroll dialog"
          p={4}
          width="700px"
          maxWidth="80vW"
          maxHeight="70vh"
          overflow="auto"
        >
          <Flex flexDirection="column" gap={3}>
            <Typography variant="h5" m={0}>
              Paper-scroll modal
            </Typography>
            {paragraphs.map((paragraph) => (
              <Typography key={paragraph} variant="body2" color="secondary" m={0}>
                {paragraph} — content scrolls within the surface while the page stays put.
              </Typography>
            ))}
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </Flex>
        </Paper>
      </Modal>
    </>
  )
}

export const ScrollPaper: Story = {
  args: {
    scroll: 'paper',
    hasBackdrop: true,
    shouldUsePortal: true,
    shouldKeepMounted: false,
    shouldLockScroll: true,
    shouldAutoFocus: true,
    shouldTrapFocus: true,
    shouldEnforceFocus: true,
    shouldRestoreFocus: true,
  },
  render: (args) => <ScrollPaperDemo {...args} />,
}

const ScrollBodyDemo = (args: ModalArgs) => {
  const [isOpen, setIsOpen] = useState(false)
  const paragraphs = Array.from({ length: 40 }, (_, i) => `Paragraph ${i + 1}`)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {/* No height cap: the surface grows past the viewport and the whole root scrolls. */}
        <Paper
          role="dialog"
          aria-modal="true"
          aria-label="Body-scroll dialog"
          p={4}
          m={4}
          width="600px"
          maxWidth="80vW"
        >
          <Flex flexDirection="column" gap={3}>
            <Typography variant="h5" m={0}>
              Body-scroll modal
            </Typography>
            {paragraphs.map((paragraph) => (
              <Typography key={paragraph} variant="body2" color="secondary" m={0}>
                {paragraph} — the surface and backdrop scroll together within the root.
              </Typography>
            ))}
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </Flex>
        </Paper>
      </Modal>
    </>
  )
}

export const ScrollBody: Story = {
  args: {
    scroll: 'body',
    hasBackdrop: true,
    shouldUsePortal: true,
    shouldKeepMounted: false,
    shouldLockScroll: true,
    shouldAutoFocus: true,
    shouldTrapFocus: true,
    shouldEnforceFocus: true,
    shouldRestoreFocus: true,
  },
  render: (args) => <ScrollBodyDemo {...args} />,
}

const FormDemo = (args: ModalArgs) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open form</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Paper role="dialog" aria-modal="true" aria-label="Sign in" p={4} width="360px">
          <Flex
            as="form"
            flexDirection="column"
            gap={3}
            onSubmit={(event) => {
              event.preventDefault()
              setIsOpen(false)
            }}
          >
            <Typography variant="h5" m={0}>
              Sign in
            </Typography>
            <TextInput fullWidth autoFocus inputProps={{ placeholder: 'Email' }} />
            <TextInput fullWidth inputProps={{ type: 'password', placeholder: 'Password' }} />
            <Flex gap={2} justifyContent="flex-end">
              <Button type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </Flex>
          </Flex>
        </Paper>
      </Modal>
    </>
  )
}

export const Form: Story = {
  args: {
    scroll: 'paper',
    hasBackdrop: true,
    shouldUsePortal: true,
    shouldKeepMounted: false,
    shouldLockScroll: true,
    shouldAutoFocus: true,
    shouldTrapFocus: true,
    shouldEnforceFocus: true,
    shouldRestoreFocus: true,
  },
  render: (args) => <FormDemo {...args} />,
}
