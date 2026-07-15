import { usePageContext } from 'src/hooks/usePageContext'
import { Link, type LinkProps } from '@soroush.tech/design-system/Link'

export type NavLinkProps = LinkProps

export function NavLink({ href, color, ...rest }: Readonly<NavLinkProps>) {
  const { urlPathname } = usePageContext()
  const isActive =
    href === '/' ? urlPathname === href : href !== undefined && urlPathname?.startsWith(href)

  return (
    <Link
      href={href}
      underline="hover"
      {...rest}
      color={isActive ? 'primary' : (color ?? 'secondary')}
    />
  )
}
