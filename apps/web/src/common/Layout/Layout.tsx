import { Suspense, type ReactNode } from 'react'
import { Flex } from '@soroush.tech/design-system/Flex'
import { CircularProgress } from '@soroush.tech/design-system/CircularProgress'
import { Header } from 'src/common/Header'
import { Footer } from 'src/common/Footer'
import { CookieNotice } from 'src/common/CookieNotice'
import { Blueprint, type BlueprintProps } from 'src/common/Blueprint'

export interface LayoutProps {
  children: ReactNode
  /** Wraps children in a Suspense boundary. `true` shows a centered CircularProgress; a node is used as the fallback as-is. */
  loading?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  blueprintProps?: Omit<BlueprintProps, 'children'>
}

const centeredLoader = (
  <Flex flex={1} alignItems="center" justifyContent="center">
    <CircularProgress />
  </Flex>
)

export function Layout({
  children,
  loading,
  header = <Header />,
  footer = <Footer />,
  blueprintProps,
}: Readonly<LayoutProps>) {
  const fallback = loading === true ? centeredLoader : loading
  return (
    <Flex flexDirection="column" minHeight="100vh">
      {header}
      <Blueprint as="main" scanline pt={8} flex={1} {...blueprintProps}>
        {loading ? <Suspense fallback={fallback}>{children}</Suspense> : children}
      </Blueprint>
      <CookieNotice />
      {footer}
    </Flex>
  )
}
