// Typed rewrite of @styled-system/core (styled-system v5).
// Public surface and observable behavior match upstream; internals are modern TS.
import type * as CSS from 'csstype'

// Internal shape of the objects parsers build up (arbitrary CSS keys → values or
// nested media-query/selector objects). Kept loose for the implementation.
export type StyleObject = Record<string, any>

type CSSLength = string | number

/**
 * A CSS-in-JS style object: typed CSS properties plus nested selectors, at-rules
 * (media queries), and pseudo-classes. Structurally compatible with the `CSSObject`
 * of Emotion and styled-components, so a {@link Parser} can be dropped straight into
 * either engine's `styled()` as an interpolation.
 */
export interface CSSObject extends CSS.Properties<CSSLength>, CSS.PropertiesHyphen<CSSLength> {
  [selectorOrAtRule: string]: CSSObject | string | number | undefined
}

export interface Theme {
  breakpoints?: readonly (string | number)[] | Record<string, string | number>
  disableStyledSystemCache?: boolean
  [key: string]: any
}

export interface Props {
  theme?: Theme
  [key: string]: any
}

// Loose by design, matching @styled-system/core's `(value: any, scale?: any, props: any) => any`.
// Props stays an internal helper; public signatures use `any` so consumer transforms and
// CSS-in-JS interpolations don't hit strict-props friction (mirrors upstream).
export type Transform = (value: any, scale?: any, props?: any) => any

export interface StyleFn {
  (value: any, scale?: any, props?: any): StyleObject | undefined
  scale?: string
  defaults?: any
}

export interface ConfigStyle {
  property?: string
  properties?: string[]
  scale?: string
  transform?: Transform
  defaultScale?: any
}

export type SystemConfig = Record<string, boolean | StyleFn | ConfigStyle>
export type ParserConfig = Record<string, StyleFn>

// Upstream @types/styled-system names, aliased to our engine types for drop-in imports.
export type styleFn = Parser
export type Config = SystemConfig
export type ConfigFunction = StyleFn

interface ParserCache {
  breakpoints?: readonly (string | number)[] | Record<string, string | number>
  media?: (string | null)[]
}

export interface Parser {
  // TEMPORARY loosening to match the original @styled-system `styleFn`
  // (`(...args: any[]): any`). The `any` return makes Emotion treat style
  // functions (layout, space, …) as permissive interpolations, so consumers'
  // `styled('svg')(layout, …)` accept styled-system props as they did upstream.
  // TODO(next version): restore the strict `<P extends { theme?: unknown }>(props: P): CSSObject`
  // signature once consumer styled components declare their prop generics.
  (...args: any[]): any
  config: ParserConfig
  propNames: string[]
  cache: ParserCache
}

export const merge = (a: StyleObject, b: StyleObject): StyleObject => {
  const result: StyleObject = { ...a, ...b }
  for (const key in a) {
    if (!a[key] || typeof b[key] !== 'object') continue
    Object.assign(result, {
      [key]: Object.assign(a[key] as object, b[key] as object),
    })
  }
  return result
}

// sort object-value responsive styles
const sort = (obj: StyleObject): StyleObject => {
  const next: StyleObject = {}
  Object.keys(obj)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .forEach((key) => {
      next[key] = obj[key]
    })
  return next
}

const defaults = {
  breakpoints: [40, 52, 64].map((n) => n + 'em'),
}
const createMediaQuery = (n: string | number): string => `@media screen and (min-width: ${n})`
const getValue = (n: unknown, scale: unknown): unknown => get(scale, n as string, n)

export const get = (obj: any, key?: string | number, def?: any, p = 0, undef?: any): any => {
  const path = typeof key === 'string' ? key.split('.') : [key]
  let value = obj
  for (; p < path.length; p++) {
    value = value ? (value as Record<string, unknown>)[path[p] as string] : undef
  }
  return value === undef ? def : value
}

const parseResponsiveStyle = (
  mediaQueries: (string | null)[],
  sx: StyleFn,
  scale: unknown,
  raw: unknown[],
  props: Props
): StyleObject => {
  const styles: StyleObject = {}
  raw.slice(0, mediaQueries.length).forEach((value, i) => {
    const media = mediaQueries[i]
    const style = sx(value, scale, props)
    if (media) {
      Object.assign(styles, {
        [media]: { ...(styles[media] as StyleObject), ...style },
      })
    } else {
      Object.assign(styles, style)
    }
  })
  return styles
}

const parseResponsiveObject = (
  breakpoints: ParserCache['breakpoints'],
  sx: StyleFn,
  scale: unknown,
  raw: Record<string, unknown>,
  props: Props
): StyleObject => {
  const styles: StyleObject = {}
  for (const key in raw) {
    const breakpoint = (breakpoints as Record<string, string | number>)[key]
    const value = raw[key]
    const style = sx(value, scale, props)
    if (breakpoint) {
      const media = createMediaQuery(breakpoint)
      Object.assign(styles, {
        [media]: { ...(styles[media] as StyleObject), ...style },
      })
    } else {
      Object.assign(styles, style)
    }
  }
  return styles
}

export const createParser = (config: ParserConfig): Parser => {
  const cache: ParserCache = {}
  const parse = ((props: Props): StyleObject => {
    let styles: StyleObject = {}
    let shouldSort = false
    const isCacheDisabled = props.theme?.disableStyledSystemCache

    for (const key in props) {
      if (!config[key]) continue
      const sx = config[key]
      const raw = props[key]
      const scale = get(props.theme, sx.scale, sx.defaults)

      if (typeof raw === 'object') {
        cache.breakpoints =
          (!isCacheDisabled && cache.breakpoints) ||
          (get(props.theme, 'breakpoints', defaults.breakpoints) as ParserCache['breakpoints'])
        if (Array.isArray(raw)) {
          cache.media = (!isCacheDisabled && cache.media) || [
            null,
            ...(cache.breakpoints as (string | number)[]).map(createMediaQuery),
          ]
          styles = merge(styles, parseResponsiveStyle(cache.media, sx, scale, raw, props))
          continue
        }
        if (raw !== null) {
          styles = merge(
            styles,
            parseResponsiveObject(
              cache.breakpoints,
              sx,
              scale,
              raw as Record<string, unknown>,
              props
            )
          )
          shouldSort = true
        }
        continue
      }

      Object.assign(styles, sx(raw, scale, props))
    }

    if (shouldSort) {
      styles = sort(styles)
    }

    return styles
  }) as unknown as Parser
  parse.config = config
  parse.propNames = Object.keys(config)
  parse.cache = cache

  const keys = Object.keys(config).filter((k) => k !== 'config')
  if (keys.length > 1) {
    keys.forEach((key) => {
      Object.assign(parse, { [key]: createParser({ [key]: config[key] }) })
    })
  }

  return parse
}

export const createStyleFunction = ({
  properties,
  property,
  scale,
  transform = getValue,
  defaultScale,
}: ConfigStyle): StyleFn => {
  const props = properties || [property as string]
  const sx: StyleFn = (value, scaleArg, styleProps) => {
    const result: StyleObject = {}
    const n = transform(value, scaleArg, styleProps)
    if (n === null) return
    props.forEach((prop) => {
      result[prop] = n
    })
    return result
  }
  sx.scale = scale
  sx.defaults = defaultScale
  return sx
}

// v5 API
export const system = (args: SystemConfig = {}): Parser => {
  const config: ParserConfig = {}
  Object.keys(args).forEach((key) => {
    const conf = args[key]
    if (conf === true) {
      config[key] = createStyleFunction({ property: key, scale: key })
      return
    }
    if (typeof conf === 'function') {
      config[key] = conf
      return
    }
    config[key] = createStyleFunction(conf as ConfigStyle)
  })

  return createParser(config)
}

export const compose = (...parsers: (Parser | undefined)[]): Parser => {
  const config: ParserConfig = {}
  parsers.forEach((parser) => {
    if (!parser?.config) return
    Object.assign(config, parser.config)
  })

  return createParser(config)
}
