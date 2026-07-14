import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { type IconName } from '@soroush.tech/design-system/Icon'
import { IconCard } from 'src/common/IconCard'
import { Eyebrow } from 'src/common/Eyebrow'

const domains: Array<{ icon: IconName; tag: string; title: string; body: string }> = [
  {
    icon: 'neurology',
    tag: 'DOMAIN_01',
    title: 'AI Architecture & Design',
    body: 'Deep dive into integrating generative AI models within complex development flow and UI patterns.',
  },
  {
    icon: 'database',
    tag: 'DOMAIN_02',
    title: 'Intelligent Systems',
    body: 'Architecting RAG pipelines integrated with Model Context Protocol (MCP) clients and servers to standardize and secure AI access to enterprise data and tools.',
  },
  {
    icon: 'stacks',
    tag: 'DOMAIN_03',
    title: 'Next-Gen Full-Stack',
    body: 'Mastering the bleeding edge of the full-stack landscape with NestJS, PostgreSQL, and high-performance serverless logic.',
  },
]

export function CurrentFocus() {
  return (
    <View as="section" py={10} px={4}>
      <View maxWidth="1280px" mx="auto">
        <Flex flexDirection="row" alignItems="center" flexWrap="wrap" gap={4} mb={8}>
          <Eyebrow>
            <Typography variant="h2" color="initial" fontWeight="bold" m={0}>
              Current Focus
            </Typography>
          </Eyebrow>
        </Flex>

        <Grid gridTemplateColumns={['1fr', '1fr', 'repeat(3, 1fr)']} gap={4}>
          {domains.map(({ icon, tag, title, body }) => (
            <IconCard key={tag} icon={icon} title={title} body={body} />
          ))}
        </Grid>
      </View>
    </View>
  )
}
