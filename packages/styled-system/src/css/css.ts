// Typed rewrite of @styled-system/css (styled-system v5).
// Standalone — does not depend on ./core; carries its own get/responsive/scales.

export type CSSObject = Record<string, unknown>

export interface CssTheme {
  breakpoints?: (string | number)[]
  [key: string]: unknown
}

type CssArg = CSSObject | ((theme: CssTheme) => CSSObject)

// based on https://github.com/developit/dlv
export const get = (
  obj: unknown,
  key?: string | number,
  def?: unknown,
  p = 0,
  undef?: unknown
): unknown => {
  const path = typeof key === 'string' ? key.split('.') : [key]
  let value = obj
  for (; p < path.length; p++) {
    value = value ? (value as Record<string, unknown>)[path[p] as string] : undef
  }
  return value === undef ? def : value
}

const defaultBreakpoints = [40, 52, 64].map((n) => n + 'em')

const defaultTheme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
}

const aliases: Record<string, string> = {
  bg: 'backgroundColor',
  m: 'margin',
  mt: 'marginTop',
  mr: 'marginRight',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mx: 'marginX',
  my: 'marginY',
  p: 'padding',
  pt: 'paddingTop',
  pr: 'paddingRight',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  px: 'paddingX',
  py: 'paddingY',
}

const multiples: Record<string, string[]> = {
  marginX: ['marginLeft', 'marginRight'],
  marginY: ['marginTop', 'marginBottom'],
  paddingX: ['paddingLeft', 'paddingRight'],
  paddingY: ['paddingTop', 'paddingBottom'],
  size: ['width', 'height'],
}

const scales: Record<string, string> = {
  color: 'colors',
  backgroundColor: 'colors',
  borderColor: 'colors',
  margin: 'space',
  marginTop: 'space',
  marginRight: 'space',
  marginBottom: 'space',
  marginLeft: 'space',
  marginX: 'space',
  marginY: 'space',
  padding: 'space',
  paddingTop: 'space',
  paddingRight: 'space',
  paddingBottom: 'space',
  paddingLeft: 'space',
  paddingX: 'space',
  paddingY: 'space',
  top: 'space',
  right: 'space',
  bottom: 'space',
  left: 'space',
  gridGap: 'space',
  gridColumnGap: 'space',
  gridRowGap: 'space',
  gap: 'space',
  columnGap: 'space',
  rowGap: 'space',
  fontFamily: 'fonts',
  fontSize: 'fontSizes',
  fontWeight: 'fontWeights',
  lineHeight: 'lineHeights',
  letterSpacing: 'letterSpacings',
  border: 'borders',
  borderTop: 'borders',
  borderRight: 'borders',
  borderBottom: 'borders',
  borderLeft: 'borders',
  borderWidth: 'borderWidths',
  borderStyle: 'borderStyles',
  borderRadius: 'radii',
  borderTopRightRadius: 'radii',
  borderTopLeftRadius: 'radii',
  borderBottomRightRadius: 'radii',
  borderBottomLeftRadius: 'radii',
  borderTopWidth: 'borderWidths',
  borderTopColor: 'colors',
  borderTopStyle: 'borderStyles',
  borderBottomWidth: 'borderWidths',
  borderBottomColor: 'colors',
  borderBottomStyle: 'borderStyles',
  borderLeftWidth: 'borderWidths',
  borderLeftColor: 'colors',
  borderLeftStyle: 'borderStyles',
  borderRightWidth: 'borderWidths',
  borderRightColor: 'colors',
  borderRightStyle: 'borderStyles',
  outlineColor: 'colors',
  boxShadow: 'shadows',
  textShadow: 'shadows',
  zIndex: 'zIndices',
  width: 'sizes',
  minWidth: 'sizes',
  maxWidth: 'sizes',
  height: 'sizes',
  minHeight: 'sizes',
  maxHeight: 'sizes',
  flexBasis: 'sizes',
  size: 'sizes',
  // svg
  fill: 'colors',
  stroke: 'colors',
}

const positiveOrNegative = (scale: unknown, value: unknown): unknown => {
  if (typeof value !== 'number' || value >= 0) {
    return get(scale, value as string | number, value)
  }
  const absolute = Math.abs(value)
  const n = get(scale, absolute, absolute)
  if (typeof n === 'string') return '-' + n
  return (n as number) * -1
}

const transforms = [
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginX',
  'marginY',
  'top',
  'bottom',
  'left',
  'right',
].reduce<Record<string, (scale: unknown, value: unknown, fallback?: unknown) => unknown>>(
  (acc, curr) => ({ ...acc, [curr]: positiveOrNegative }),
  {}
)

export const responsive =
  (styles: CSSObject) =>
  (theme: CssTheme): CSSObject => {
    const next: CSSObject = {}
    const breakpoints = get(theme, 'breakpoints', defaultBreakpoints) as (string | number)[]
    const mediaQueries = [null, ...breakpoints.map((n) => `@media screen and (min-width: ${n})`)]

    for (const key in styles) {
      const value =
        typeof styles[key] === 'function'
          ? (styles[key] as (t: CssTheme) => unknown)(theme)
          : styles[key]

      if (value == null) continue
      if (!Array.isArray(value)) {
        next[key] = value
        continue
      }
      const slice = value.slice(0, mediaQueries.length)
      for (let i = 0; i < slice.length; i++) {
        const media = mediaQueries[i]
        if (!media) {
          next[key] = slice[i]
          continue
        }
        const block = (next[media] as CSSObject) || {}
        next[media] = block
        if (slice[i] == null) continue
        block[key] = slice[i]
      }
    }

    return next
  }

export const css =
  (args: CssArg) =>
  (props: Record<string, unknown> = {}): CSSObject => {
    const theme: CssTheme = {
      ...defaultTheme,
      ...((props.theme as CssTheme) || (props as CssTheme)),
    }
    let result: CSSObject = {}
    const obj = typeof args === 'function' ? args(theme) : args
    const styles = responsive(obj)(theme)

    for (const key in styles) {
      const x = styles[key]
      const val = typeof x === 'function' ? (x as (t: CssTheme) => unknown)(theme) : x

      if (key === 'variant') {
        const variant = css(get(theme, val as string) as CssArg)(theme)
        result = { ...result, ...variant }
        continue
      }

      if (val && typeof val === 'object') {
        result[key] = css(val as CssArg)(theme)
        continue
      }

      const prop = get(aliases, key, key) as string
      const scaleName = get(scales, prop) as string | undefined
      const scale = get(theme, scaleName, get(theme, prop, {}))
      const transform = get(transforms, prop, get) as (
        scale: unknown,
        value: unknown,
        fallback?: unknown
      ) => unknown
      const value = transform(scale, val, val)

      if (multiples[prop]) {
        const dirs = multiples[prop]
        for (const dir of dirs) {
          result[dir] = value
        }
      } else {
        result[prop] = value
      }
    }

    return result
  }

export default css
