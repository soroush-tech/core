import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Breadcrumbs } from '@soroush.tech/design-system/Breadcrumbs'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Link } from '@soroush.tech/design-system/Link'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'
import { LONG_TRAIL, SHORT_TRAIL } from './BreadcrumbsCard.data'

function Trail({ label, crumbs }: Readonly<{ label: string; crumbs: readonly string[] }>) {
  const ancestors = crumbs.slice(0, -1)
  const current = crumbs.at(-1)

  return (
    <Breadcrumbs
      aria-label={label}
      expandLabel="Show full path"
      maxItems={3}
      typography="caption"
      fontFamily="mono"
    >
      {ancestors.map((crumb) => (
        <Link key={crumb} href="#" underline="hover" color="inherit">
          {crumb}
        </Link>
      ))}
      <Typography variant="caption" fontFamily="mono" color="primary" aria-current="page">
        {current}
      </Typography>
    </Breadcrumbs>
  )
}

export function BreadcrumbsCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="BREADCRUMBS"
          docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/breadcrumbs/`}
        />
      }
      caption="A named nav landmark of ordered crumbs. Past maxItems the trail collapses to its ends and a button that expands the whole path."
    >
      <Flex gap={4}>
        <Flex>
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            FULL_TRAIL
          </Typography>
          <Trail label="Short trail" crumbs={SHORT_TRAIL} />
        </Flex>
        <Flex>
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            COLLAPSED_TRAIL
          </Typography>
          <Trail label="Long trail" crumbs={LONG_TRAIL} />
        </Flex>
      </Flex>
    </Card>
  )
}
