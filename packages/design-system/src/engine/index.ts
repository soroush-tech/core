// Raw engine escape hatches — most apps only need `Global` + `globalStyles` to render
// their own global styles. `CacheProvider` + `styleCache` are SSR-only, for critical-CSS
// extraction (e.g. `@emotion/server`).
export { Global, CacheProvider } from '../theme/emotion'
export { default as styleCache } from './styleCache'
export { globalStyles } from './globalStyles'
