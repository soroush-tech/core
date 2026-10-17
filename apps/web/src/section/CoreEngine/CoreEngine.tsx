import { styled } from '@soroush.tech/design-system'
import { Flex } from '@soroush.tech/design-system/Flex'
import { View } from '@soroush.tech/design-system/View'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Icon } from '@soroush.tech/design-system/Icon'
import { specs } from './CoreEngine.data'

const FULL = { xs: 4, sm: 8, md: 12 }

// 1px hairline gaps: gap uses the thin border-width token (no 1px space token) and
// the grid's background shows through the gaps as hairlines between the tiles
const HairlineGrid = styled(Grid, { label: 'HairlineGrid' })`
  gap: ${({ theme }) => theme.borderWidths.thin};
  background-color: ${({ theme }) => theme.border.light};
`

// :hover background change - no styled-system hover prop
const EngineTile = styled(Paper, { label: 'EngineTile' })`
  &:hover {
    background-color: ${({ theme }) => theme.background.paper};
  }
`

export function CoreEngine() {
  return (
    <View as="section" bg="terminal" py={10}>
      <Grid layout>
        <Flex span={FULL} alignItems="center" gap={2} mb={10} textAlign="center">
          <Typography variant="overline" color="primary" fontWeight="bold" letterSpacing="widest">
            MODERN TOOLING
          </Typography>
          <Typography
            variant="h1"
            as="h2"
            color="initial"
            fontWeight="black"
            letterSpacing="tighter"
          >
            CORE ENGINE SPECIFICATIONS
          </Typography>
        </Flex>

        {/* Its own layout grid, edge to edge (fluid - an auto-margin grid item would shrink to
            fit): the hairlines are its background showing through */}
        <HairlineGrid span={FULL} layout={{ margin: 0, gutter: '1px', mode: 'fluid' }}>
          {specs.map(({ name, icon }) => (
            <EngineTile
              key={name}
              span={2}
              elevation={0}
              bg="primary"
              aspectRatio={1}
              p={4}
              gap={3}
              alignItems="center"
              justifyContent="center"
              transition="background-color 0.2s ease"
            >
              <Icon name={icon} color="initial" size="2rem" />
              <Typography
                variant="caption"
                color="initial"
                fontWeight="bold"
                letterSpacing="widest"
                textTransform="uppercase"
                align="center"
              >
                {name}
              </Typography>
            </EngineTile>
          ))}
        </HairlineGrid>
      </Grid>
    </View>
  )
}
