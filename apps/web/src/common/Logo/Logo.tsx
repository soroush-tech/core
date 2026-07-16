import { styled } from '@soroush.tech/design-system'
import LogoSvg from 'src/assets/soroush.svg'

interface LogoProps {
  size?: number
  alt?: string
}

const LogoImg = styled('img', { label: 'Logo' })`
  display: block;
  filter: ${({ theme }) => theme.logoFilter};
  transition: filter 0.5s;
  &:hover {
    filter: none;
  }
`

export function Logo({ size = 48, alt = 'Soroush logo' }: Readonly<LogoProps>) {
  return <LogoImg src={LogoSvg} alt={alt} width={size} height={size} />
}
