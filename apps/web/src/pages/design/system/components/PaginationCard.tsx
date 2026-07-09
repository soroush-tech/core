import { useState } from 'react'
import { STORYBOOK_URL } from 'src/config'
import { Card } from 'src/theme/Card'
import { Flex } from 'src/theme/Flex'
import { Pagination } from 'src/theme/Pagination'
import { Typography } from 'src/theme/Typography'
import { View } from 'src/theme/View'
import { CardTitle } from './CardTitle'

const PAGE_COUNT = 12

export function PaginationCard() {
  const [page, setPage] = useState(1)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="PAGINATION"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-pagination-pagination--docs`}
        />
      }
      caption="1-based page navigation with ellipsis ranges and optional first/last controls. Both instances below share one controlled page state."
    >
      <Flex flexDirection="column" gap={4}>
        <View>
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={1}
            fontFamily="mono"
          >
            TEXT_CIRCULAR
          </Typography>
          <Pagination
            count={PAGE_COUNT}
            page={page}
            onChange={setPage}
            color="primary"
            shouldShowFirstButton
            shouldShowLastButton
          />
        </View>
        <View>
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={1}
            fontFamily="mono"
          >
            OUTLINED_ROUNDED
          </Typography>
          <Pagination
            count={PAGE_COUNT}
            page={page}
            onChange={setPage}
            variant="outlined"
            shape="rounded"
            color="secondary"
            size="sm"
          />
        </View>
        <Typography variant="caption" color="secondary" fontFamily="mono">
          PAGE_{page}/{PAGE_COUNT}
        </Typography>
      </Flex>
    </Card>
  )
}
