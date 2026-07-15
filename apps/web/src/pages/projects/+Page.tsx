import { Layout } from 'src/common/Layout'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'

function Projects() {
  return (
    <Layout>
      <Flex
        as="main"
        justifyContent="space-between"
        alignItems="center"
        minHeight="100vh"
        px={2}
        py={3}
      >
        <Flex p={2} maxWidth={1200}>
          <Flex as="header">
            <Typography as="h1">Projects</Typography>
          </Flex>

          <View as="section" mb={2}>
            <Typography as="h2">xxxx</Typography>
          </View>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default Projects
