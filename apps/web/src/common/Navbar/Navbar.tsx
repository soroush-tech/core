import { Flex, type GapToken } from '@soroush.tech/design-system/Flex'
import { NavLink, type NavLinkProps } from 'src/common/NavLink'

export type NavItem = { href: string; label: string; target?: string }
export type NavbarDirection = 'horizontal' | 'vertical'

export interface NavbarProps extends Pick<NavLinkProps, 'variant' | 'letterSpacing' | 'underline'> {
  items: NavItem[]
  direction?: NavbarDirection
  gap?: GapToken
  'aria-label'?: string
}

export function Navbar({
  items,
  direction = 'horizontal',
  gap,
  variant,
  letterSpacing,
  underline = 'hover',
  'aria-label': ariaLabel,
}: Readonly<NavbarProps>) {
  return (
    <Flex
      as="nav"
      aria-label={ariaLabel}
      flexDirection={direction === 'horizontal' ? 'row' : 'column'}
      alignItems={direction === 'horizontal' ? 'center' : undefined}
      gap={gap}
    >
      {items.map(({ href, label, target }) => (
        <NavLink
          key={href}
          href={href}
          aria-label={label}
          target={target}
          variant={variant}
          letterSpacing={letterSpacing}
          underline={underline}
        >
          {label}
        </NavLink>
      ))}
    </Flex>
  )
}
