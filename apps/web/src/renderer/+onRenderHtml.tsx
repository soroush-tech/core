import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import createEmotionServer from '@emotion/server/create-instance'
import { Bootstrap } from '../common/Bootstrap'
import type { OnRenderHtmlAsync } from 'vike/types'
import { styleCache } from '@soroush.tech/design-system/engine'
import faviconUrl from 'src/assets/soroush_logo.svg'
import { buildHead } from './buildHead'

export const onRenderHtml: OnRenderHtmlAsync = async (
  pageContext
): ReturnType<OnRenderHtmlAsync> => {
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(styleCache)
  const html = renderToString(<Bootstrap pageContext={pageContext} />)
  const chunks = extractCriticalToChunks(html)
  const styles = constructStyleTagsFromChunks(chunks)
  const template = `<!doctype html>
  <html lang="en">
   <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
    <link rel="icon" type="image/svg+xml" href="${faviconUrl}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${buildHead(pageContext)}
    ${styles}
    </head>
    <body>
      <div id="root">${html}</div>
    </body>
  </html>`
  return escapeInject`${dangerouslySkipEscape(template)}`
}
