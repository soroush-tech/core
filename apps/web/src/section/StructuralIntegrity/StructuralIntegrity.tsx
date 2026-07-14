import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { stats } from './StructuralIntegrity.data'

export function StructuralIntegrity() {
  return (
    <View as="section" bg="paper" py={10} px={4}>
      <Grid
        gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)']}
        gap={8}
        alignItems="start"
        maxWidth="1280px"
        mx="auto"
      >
        <View>
          <Typography
            variant="overline"
            as="p"
            color="primary"
            letterSpacing="widest"
            textTransform="uppercase"
            mb={4}
          >
            Philosophy / 01
          </Typography>
          <Typography
            variant="h2"
            color="initial"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="tight"
            lineHeight="tight"
            m={0}
          >
            Code as
            <br />
            Structural
            <br />
            Integrity
          </Typography>
        </View>

        <Flex gap={8}>
          <View bg="default" p={4}>
            <Typography variant="body1" fontSize={3} color="secondary" lineHeight="relaxed" m={0}>
              &ldquo;Architecture is not just about the final structure; it&rsquo;s about the
              resilience of every node, the efficiency of every data packet, and the elegance of the
              logic flow.&rdquo;
            </Typography>
          </View>

          <Grid gridTemplateColumns="repeat(2, 1fr)" gap={6}>
            {stats.map(({ value, label }) => (
              <View key={label}>
                <Typography
                  variant="h2"
                  as="p"
                  color="primary"
                  fontWeight="bold"
                  lineHeight="none"
                  mb={2}
                >
                  {value}
                </Typography>
                <Typography
                  variant="caption"
                  color="secondary"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  m={0}
                >
                  {label}
                </Typography>
              </View>
            ))}
          </Grid>
        </Flex>
      </Grid>
    </View>
  )
}
