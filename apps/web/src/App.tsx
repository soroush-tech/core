import Logo from '/soroush.svg'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import Email from 'src/assets/email.svg'
import LinkedIn from 'src/assets/linkedin.svg'
import GitHub from 'src/assets/github.svg'
import { View } from '@soroush.tech/design-system/View'

function App() {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      bg="primary"
      minHeight="100vh"
      px={2}
      py={3}
    >
      <Flex justifyContent="center" alignItems="center" minHeight="80vh">
        <a href="https://soroush.tech">
          <img src={Logo} alt="Soroush logo" />
        </a>
        <Typography as="h1">SOROUSH™</Typography>

        <Typography fontSize={5}>Coming soon.</Typography>
        <Typography>Under construction, but worth the wait.</Typography>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center" flexDirection="row">
        <View m={0.5}>
          <a href="mailto:masoud@soroush.tech">
            <img width={36} height={36} src={Email} alt="Soroush Email" />
          </a>
        </View>
        <View m={0.5}>
          <a href="https://www.linkedin.com/in/masoud-soroush-4139b152" target="_blank">
            <img width={36} height={36} src={LinkedIn} alt="Soroush LinkedIn" />
          </a>
        </View>
        <View m={0.5}>
          <a href="https://github.com/soroush-tech/core">
            <img width={36} height={36} src={GitHub} alt="Soroush GitHub" />
          </a>
        </View>
      </Flex>
    </Flex>
  )
}

export default App
