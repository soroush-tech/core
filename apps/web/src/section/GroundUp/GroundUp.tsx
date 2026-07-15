import { View } from '@soroush.tech/design-system/View'
import { Typography } from '@soroush.tech/design-system/Typography'

export function GroundUp() {
  return (
    <View as="section" bg="terminal" py={10} px={4} position="relative" overflow="hidden">
      <View maxWidth="1280px" mx="auto" position="relative" zIndex={1} textAlign="center">
        <Typography
          variant="caption"
          as="p"
          color="primary"
          fontWeight="bold"
          letterSpacing="widest"
          textTransform="uppercase"
          mb={4}
        >
          THE GROUND UP
        </Typography>

        <Typography
          variant="h1"
          as="h2"
          color="initial"
          fontWeight="black"
          letterSpacing="tighter"
          lineHeight="none"
          mb={8}
        >
          COMPLEX CHALLENGES // ROBUST SOLUTIONS
        </Typography>

        <Typography variant="body1" fontSize={3} color="secondary" lineHeight="relaxed" mb={10}>
          True engineering excellence starts at the foundational layer. Soroush specializes in
          breaking down monolithic complexity into manageable, high-performance micro-modules. By
          focusing on Developer Experience (DX) in fast forward environment, he ensures that systems
          are not only robust for the machine but sustainable for the human who maintain them.
        </Typography>
      </View>
    </View>
  )
}
