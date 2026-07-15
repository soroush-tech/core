import { useState } from 'react'
import { STORYBOOK_URL } from 'src/config'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Modal } from '@soroush.tech/design-system/Modal'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function ModalCard() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="MODAL" storybookHref={`${STORYBOOK_URL}?path=/docs/theme-modal--docs`} />
      }
      caption="The low-level overlay primitive — portals its content, dims the page with a Backdrop, traps focus, locks body scroll, and closes on Escape or backdrop click."
    >
      <Flex flexDirection="row">
        <Button variant="outlined" color="primary" size="sm" onClick={() => setIsOpen(true)}>
          OPEN_MODAL
        </Button>
      </Flex>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Paper
          role="dialog"
          aria-modal="true"
          aria-label="Modal demo"
          elevation={16}
          p={5}
          maxWidth="420px"
        >
          <Typography variant="overline" color="primary" fontFamily="mono" display="block" mb={2}>
            MODAL_DIALOG
          </Typography>
          <Typography variant="caption" color="secondary" fontFamily="mono" display="block" mb={4}>
            Focus is trapped here and the page behind is inert until this closes.
          </Typography>
          <Flex flexDirection="row" justifyContent="flex-end">
            <Button variant="contained" color="primary" size="sm" onClick={() => setIsOpen(false)}>
              CLOSE
            </Button>
          </Flex>
        </Paper>
      </Modal>
    </Card>
  )
}
