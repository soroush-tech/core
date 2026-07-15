import { styled } from '@soroush.tech/design-system'
import { Flex } from '@soroush.tech/design-system/Flex'
import { View } from '@soroush.tech/design-system/View'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Link } from '@soroush.tech/design-system/Link'
import { alpha } from '@soroush.tech/design-system/utils'
import { languages, frameworks, deploymentTags, qaTags } from './TechStack.data'

// grid-column span on a grid item — View has no gridColumn prop
const BentoSpan = styled(Paper, { label: 'BentoSpan' })`
  @media (min-width: 1024px) {
    grid-column: span 2;
  }
`

// background: linear-gradient + grid-column span — no styled-system equivalents
const AIHighlightCard = styled(Paper, { label: 'AIHighlightCard' })`
  background: linear-gradient(
    to bottom right,
    ${({ theme }) => alpha(theme.palette.primary.main, 0.2)},
    ${({ theme }) => theme.background.paper}
  );
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => alpha(theme.border.primary, 0.2)};
  @media (min-width: 1024px) {
    grid-column: span 2;
  }
`

export function TechStack() {
  return (
    <View as="section" bg="terminal" py={10} px={4}>
      <View maxWidth="1280px" mx="auto">
        <Grid gridTemplateColumns={['1fr', '1fr 1fr', 'repeat(4, 1fr)']} gap={2}>
          {/* Title card — spans 2 cols on large screens */}
          <BentoSpan bg="paper" p={6} elevation={0} justifyContent="flex-end">
            <Typography variant="h2" color="initial">
              The Technical Stack
            </Typography>
            <Typography variant="body2" color="primary" letterSpacing="widest" fontStyle="italic">
              18 years of JS / 9 years of React
            </Typography>
          </BentoSpan>

          {/* Languages */}
          <Paper bg="default" p={4} elevation={0}>
            <Typography variant="overline" color="primary" mb={3}>
              / LANGUAGES
            </Typography>
            <Flex gap={2}>
              {languages.map(({ name, level, accent }) => (
                <Flex
                  key={name}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1" color="initial" fontWeight="medium">
                    {name}
                  </Typography>
                  <Typography variant="caption" color={accent ? 'primary' : 'secondary'}>
                    {level}
                  </Typography>
                </Flex>
              ))}
            </Flex>
          </Paper>

          {/* Frameworks */}
          <Paper bg="default" p={4} elevation={0}>
            <Typography variant="overline" color="primary" mb={3}>
              / FRAMEWORKS
            </Typography>
            <Grid gridTemplateColumns="1fr 1fr" gap={2}>
              {frameworks.map((name) => (
                <Typography key={name} variant="body1" color="initial" fontWeight="medium">
                  {name}
                </Typography>
              ))}
            </Grid>
          </Paper>

          {/* Deployment */}
          <Paper bg="default" p={4} elevation={0}>
            <Typography variant="overline" color="primary" mb={3}>
              / DEPLOYMENT
            </Typography>
            <Flex flexDirection="row" flexWrap="wrap" gap={1}>
              {deploymentTags.map((tag) => (
                <View key={tag} bg="paper" px={1} py={0.5}>
                  <Typography variant="caption">{tag}</Typography>
                </View>
              ))}
            </Flex>
          </Paper>

          {/* QA */}
          <Paper bg="default" p={4} elevation={0}>
            <Typography variant="overline" color="primary" mb={3}>
              / QUALITY_ASSURANCE
            </Typography>
            <Flex flexDirection="row" flexWrap="wrap" gap={1}>
              {qaTags.map((tag) => (
                <View key={tag} bg="paper" px={1} py={0.5}>
                  <Typography variant="caption">{tag}</Typography>
                </View>
              ))}
            </Flex>
          </Paper>

          {/* AI highlight — spans 2 cols on large screens */}
          <AIHighlightCard p={6} elevation={0} justifyContent="center">
            <Typography variant="overline" color="primary" letterSpacing="widest" mb={2}>
              / INTEL_INTEGRATION
            </Typography>
            <Typography variant="h3" color="initial" mb={1}>
              AI &amp; Semantic Architecture
            </Typography>
            <Typography variant="body2" color="secondary" lineHeight="relaxed" mb={3}>
              Engineering high-performance AI ecosystems through Model Context Protocol (MCP) and
              RAG orchestration. Specializing in high-dimensional vector embeddings, semantic search
              optimization, and multi-tenant vector database infrastructure for enterprise-grade
              intelligence.
            </Typography>
            <Link href="#" underline="none" variant="button" color="primary" letterSpacing="widest">
              ACCESS_AI_PROTOCOLS
            </Link>
          </AIHighlightCard>
        </Grid>
      </View>
    </View>
  )
}
