import { styled } from '@soroush.tech/design-system'
import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { stats, skills } from './ExperienceSummary.data'

// palette.primary.main is not in the background scale, so the neon progress fill is
// applied via styled (same documented exception as Eyebrow).
const ProgressFill = styled(View, { label: 'ProgressFill' })`
  background-color: ${({ theme }) => theme.palette.primary.main};
`

export function ExperienceSummary() {
  return (
    <View as="section" bg="primary" py={10} px={4}>
      <Grid
        gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)']}
        gap={8}
        alignItems="start"
        maxWidth="1280px"
        mx="auto"
      >
        <View>
          <Typography variant="h2" color="initial" fontWeight="bold" mb={6}>
            Professional Summary
          </Typography>

          <Flex gap={5}>
            <Typography variant="body1" color="secondary" lineHeight="relaxed" m={0}>
              An architect of digital experiences with 18+ years track record of building{' '}
              <Typography as="span" variant="body1" color="initial" fontWeight="bold">
                resilient, scalable frontend architectures
              </Typography>
              . I specialize in developing cross-platform applications using React, React Native,
              and Node.js.
            </Typography>
            <Typography variant="body1" color="secondary" lineHeight="relaxed" m={0}>
              My philosophy focuses on{' '}
              <Typography as="span" variant="body1" color="initial" fontWeight="bold">
                Performance Optimization
              </Typography>{' '}
              and{' '}
              <Typography as="span" variant="body1" color="initial" fontWeight="bold">
                Structural Maintainability
              </Typography>
              , ensuring high-speed delivery without compromising on engineering rigor.
            </Typography>
            <View bg="grid" px={4} py={2}>
              <Typography variant="body2" color="secondary" fontStyle="italic" m={0}>
                Active Contributor to Open Source:{' '}
                <Typography as="span" variant="body2" color="primary" fontWeight="medium">
                  @material-native-ui/theme-provider
                </Typography>
              </Typography>
            </View>
          </Flex>

          <Grid gridTemplateColumns="repeat(2, 1fr)" gap={6} mt={8}>
            {stats.map(({ value, label }) => (
              <View key={label}>
                <Typography variant="h3" as="p" color="primary" fontWeight="bold" mb={1}>
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
        </View>

        <View bg="terminal" p={5}>
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center" mb={6}>
            <Typography
              variant="caption"
              as="h3"
              color="primary"
              letterSpacing="widest"
              textTransform="uppercase"
              m={0}
            >
              Technical_Stack_Matrix
            </Typography>
            <Flex flexDirection="row" gap={1} aria-hidden="true">
              <View width="0.5rem" height="0.5rem" borderRadius="9999px" bg="primary" />
              <View
                width="0.5rem"
                height="0.5rem"
                borderRadius="9999px"
                bg="primary"
                opacity={0.5}
              />
              <View width="0.5rem" height="0.5rem" borderRadius="9999px" bg="default" />
            </Flex>
          </Flex>

          <Flex gap={6}>
            {skills.map(({ label, level, tags, value }) => (
              <View key={label}>
                <Flex flexDirection="row" justifyContent="space-between" mb={2}>
                  <Typography variant="caption" color="initial" textTransform="uppercase" m={0}>
                    {label}
                  </Typography>
                  <Typography variant="caption" color="primary" m={0}>
                    {level}
                  </Typography>
                </Flex>
                <Flex flexDirection="row" flexWrap="wrap" gap={2} mb={2}>
                  {tags.map((tag) => (
                    <View key={tag} bg="secondary" px={2} py={0.5}>
                      <Typography variant="caption" color="secondary" m={0}>
                        {tag}
                      </Typography>
                    </View>
                  ))}
                </Flex>
                <View
                  bg="default"
                  height="0.25rem"
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${label} proficiency: ${level}`}
                >
                  <ProgressFill height="100%" width={`${value}%`} />
                </View>
              </View>
            ))}
          </Flex>
        </View>
      </Grid>
    </View>
  )
}
