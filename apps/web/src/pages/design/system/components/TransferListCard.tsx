import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { TransferList } from '@soroush.tech/design-system/TransferList'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'
import { ROUTES } from './TransferListCard.data'

export function TransferListCard() {
  const [cached, setCached] = useState<(string | number)[]>(['home'])

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="TRANSFER_LIST"
          docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/transfer-list/`}
        />
      }
      caption="Two lists of native checkboxes and the buttons that move the checked items across. A disabled item stays where it is; select-all checks a whole list."
    >
      <TransferList
        items={ROUTES}
        value={cached}
        onChange={setCached}
        leftLabel="ROUTES"
        rightLabel="CACHED"
        moveRightLabel="Cache the checked routes"
        moveLeftLabel="Uncache the checked routes"
        moveAllRightLabel="Cache every route"
        moveAllLeftLabel="Uncache every route"
        shouldShowMoveAll
        hasSelectAll
      />
      <Typography variant="caption" color="secondary" fontFamily="mono" mt={3}>
        CACHED: {cached.length === 0 ? 'NONE' : cached.join(', ')}
      </Typography>
    </Card>
  )
}
