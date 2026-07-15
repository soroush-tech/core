import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Button } from '@soroush.tech/design-system/Button'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Card } from '@soroush.tech/design-system/Card'
import { GlitchText } from 'src/common/GlitchText'
import { Flicker } from 'src/common/Flicker'

export function NotFound() {
  return (
    <Flex
      as="section"
      position="relative"
      p={4}
      flex={1}
      alignItems="center"
      justifyContent="center"
    >
      <View maxWidth="960px" width="100%">
        <Card bg="glass" variant="bracketBox" py={6} px={4} gap={4} position="relative">
          <Flex
            position="absolute"
            top={4}
            left={4}
            alignItems="center"
            justifyContent="center"
            style={{ pointerEvents: 'none' }}
          >
            <Flicker>
              <Icon name="warning" color="primary" size="3.75rem" />
            </Flicker>
          </Flex>
          <Flex flexDirection="column" alignItems="center">
            <GlitchText
              as="h1"
              variant="inherit"
              color="primary"
              fontWeight="bold"
              lineHeight="none"
              style={{ fontSize: 'clamp(9rem, 20vw, 16rem)' }}
              mb={1}
            >
              404
            </GlitchText>
            <GlitchText
              inverted
              mb={1}
              textAlign="center"
              color="primary"
              lineHeight="relaxed"
              style={{ fontSize: 'clamp(0.9rem, 2vw, 1.6rem)' }}
            >
              This page does not exist in this dimension.
            </GlitchText>
            <GlitchText
              as="h2"
              variant="inherit"
              color="primary"
              fontWeight="bold"
              lineHeight="none"
              mb={1}
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)' }}
            >
              Don't panic
            </GlitchText>
          </Flex>

          <Flicker>
            <Button href="/" variant="contained" color="primary" size="lg" letterSpacing="widest">
              Let's get you back to the grid.
            </Button>
          </Flicker>
        </Card>
      </View>
    </Flex>
  )
}
