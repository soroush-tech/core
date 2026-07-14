import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function GridCard() {
  return (
    <Card
      bg="paper"
      p={5}
      flex="1"
      variant="bracketBox"
      title={
        <CardTitle title="GRID" storybookHref={`${STORYBOOK_URL}?path=/docs/theme-grid--docs`} />
      }
      caption="Extends View with display:grid. Adds gap and the full set of CSS Grid layout props."
    >
      <Grid gridTemplateColumns="repeat(3, 1fr)" gap={2} mb={3}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Flex key={n} bg="default" p={2} alignItems="center" justifyContent="center">
            <Typography variant="caption" color="secondary" fontFamily="mono" opacity={0.5}>
              {n}
            </Typography>
          </Flex>
        ))}
      </Grid>
      <Typography variant="caption" color="secondary" fontFamily="mono">
        3_COL / GAP_2
      </Typography>
    </Card>
  )
}
