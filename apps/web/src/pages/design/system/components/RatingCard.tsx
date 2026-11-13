import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Rating } from '@soroush.tech/design-system/Rating'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

const labelOf = (value: number) => `${value} of 5`

export function RatingCard() {
  const [rating, setRating] = useState<number | null>(4)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="RATING" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/rating/`} />}
      caption="A group of hidden native radios drawn as icons: hover previews, the arrows change it, pressing the chosen item clears it. Read-only, it is one image named by its value."
    >
      <Flex flexDirection={['column', 'row']} gap={5}>
        <Flex flex="1">
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            INTERACTIVE
          </Typography>
          <Rating
            aria-label="Quality"
            value={rating}
            onChange={(_event, value) => setRating(value)}
            getLabelText={labelOf}
            emptyLabelText="No rating"
          />
          <Typography variant="caption" color="secondary" fontFamily="mono" mt={2}>
            VALUE: {rating === null ? 'NONE' : labelOf(rating)}
          </Typography>
        </Flex>
        <Flex flex="1">
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            READ_ONLY · HALVES
          </Typography>
          <Rating value={3.5} precision={0.5} readOnly color="primary" getLabelText={labelOf} />
        </Flex>
      </Flex>
    </Card>
  )
}
