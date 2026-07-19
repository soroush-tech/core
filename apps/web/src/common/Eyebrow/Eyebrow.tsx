import { styled } from '@soroush.tech/design-system'
import { Flex, type FlexProps } from '@soroush.tech/design-system/Flex'
import { Typography, type TypographyProps } from '@soroush.tech/design-system/Typography'

// palette.primary.main is not in theme.background scale
const EyebrowRule = styled('span', { label: 'EyebrowRule' })`
  display: block;
  width: 48px;
  height: 2px;
  background-color: ${({ theme }) => theme.palette.primary.main};
  flex-shrink: 0;
`

export interface EyebrowProps extends FlexProps {
  typographyProps?: TypographyProps
}

export function Eyebrow({ children, typographyProps = {}, ...props }: Readonly<EyebrowProps>) {
  return (
    <Flex flexDirection="row" alignItems="center" gap={2} {...props}>
      <EyebrowRule />
      <Typography
        variant="caption"
        color="primary"
        fontFamily="mono"
        letterSpacing="widest"
        textTransform="uppercase"
        m={0}
        {...typographyProps}
      >
        {children}
      </Typography>
    </Flex>
  )
}
