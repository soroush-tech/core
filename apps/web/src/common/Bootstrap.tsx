import { StrictMode } from 'react'
import { CacheProvider, styleCache } from '@soroush.tech/design-system/engine'
import type { PageContext } from 'vike/types'
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
