import { StrictMode } from 'react'
import { CacheProvider } from '@soroush.tech/design-system'
import type { PageContext } from 'vike/types'
import styleCache from '@soroush.tech/design-system/utils/styleCache'
import { Routes } from 'src/common/Routes'
import { Providers } from 'src/common/Providers'
export function Bootstrap({ pageContext }: Readonly<{ pageContext: PageContext }>) {
  return (
    <StrictMode>
      <CacheProvider value={styleCache}>
        <Providers>
          <Routes pageContext={pageContext} />
        </Providers>
      </CacheProvider>
    </StrictMode>
  )
}
