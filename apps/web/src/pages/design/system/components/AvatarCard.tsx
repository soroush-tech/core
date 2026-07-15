import avatar1x from 'src/assets/avatar/soroush_mascot_avatar@1x.png'
import avatar2x from 'src/assets/avatar/soroush_mascot_avatar@2x.png'
import avatar3x from 'src/assets/avatar/soroush_mascot_avatar@3x.png'
import { STORYBOOK_URL } from 'src/config'
import { Avatar } from '@soroush.tech/design-system/Avatar'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

const AVATARS = [
  { size: 'xl', label: 'RING', ring: true, ringColor: 'primary' },
  { size: 'xl', label: 'XL' },
  { size: 'lg', label: 'LG' },
  { size: 'md', label: 'MD' },
  { size: 'sm', label: 'SM' },
] as const

export function AvatarCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="AVATAR"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-avatar--docs`}
        />
      }
      caption="User image, initials, or icon in a consistently sized container. Three shapes (circular, rounded, square), four preset sizes, optional ring outline, and an automatic image-error fallback chain."
    >
      <Flex flexDirection="column" gap={5} flexWrap="wrap">
        <Flex flexDirection="row" alignItems="flex-end" gap={5} flexWrap="wrap">
          {AVATARS.map(({ size, label, ...rest }) => (
            <View key={label} textAlign="center">
              <Avatar
                size={size}
                variant="circular"
                {...rest}
                alt="Soroush mascot"
                src={avatar1x}
                srcSet={`${avatar1x} 1x, ${avatar2x} 2x, ${avatar3x} 3x`}
                mb={2}
              />
              <Typography
                variant="caption"
                color="secondary"
                opacity={0.5}
                display="block"
                fontFamily="mono"
              >
                {label}
              </Typography>
            </View>
          ))}
        </Flex>
        <Flex flexDirection="row" alignItems="flex-end" gap={5} flexWrap="wrap">
          {AVATARS.map(({ size, label, ...rest }) => (
            <View key={label} textAlign="center">
              <Avatar
                size={size}
                variant="square"
                {...rest}
                alt="Soroush mascot"
                src={avatar1x}
                srcSet={`${avatar1x} 1x, ${avatar2x} 2x, ${avatar3x} 3x`}
                mb={2}
              />
              <Typography
                variant="caption"
                color="secondary"
                opacity={0.5}
                display="block"
                fontFamily="mono"
              >
                {label}
              </Typography>
            </View>
          ))}
        </Flex>
      </Flex>
    </Card>
  )
}
