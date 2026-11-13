import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Snackbar } from '@soroush.tech/design-system/Snackbar'
import { CardTitle } from './CardTitle'

const AUTO_HIDE_MS = 4000

export function SnackbarCard() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="SNACKBAR" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/snackbar/`} />
      }
      caption="A transient status in a corner of the window that never takes focus. It hides itself after a timeout, paused while the pointer or focus is on it."
    >
      <Flex flexDirection="row">
        <Button variant="outlined" color="primary" size="sm" onClick={() => setIsOpen(true)}>
          SHOW_SNACKBAR
        </Button>
      </Flex>
      <Snackbar
        isOpen={isOpen}
        onClose={(_event, reason) => reason !== 'clickaway' && setIsOpen(false)}
        autoHideDuration={AUTO_HIDE_MS}
        message="CHANGES_SAVED"
        action={
          <Button variant="text" color="primary" size="sm" onClick={() => setIsOpen(false)}>
            DISMISS
          </Button>
        }
      />
    </Card>
  )
}
