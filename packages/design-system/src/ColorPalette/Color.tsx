import { Flex, type FlexProps } from '../Flex'

interface ColorProps extends Omit<FlexProps, 'color'> {
  color: string
}

export function Color({ color, ...rest }: Readonly<ColorProps>) {
  return <Flex {...rest} style={{ backgroundColor: color }} title={color} />
}
