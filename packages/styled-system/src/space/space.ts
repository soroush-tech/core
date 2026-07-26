import {
  compose,
  get,
  system,
  type SystemConfig,
  type Transform,
} from '@soroush.tech/styled-system/core'

const spaceScale = [0, 4, 8, 16, 32, 64, 128, 256, 512]

const isNumber = (n: unknown): n is number => typeof n === 'number' && !Number.isNaN(n)

const getMargin: Transform = (n, scale) => {
  if (!isNumber(n)) {
    return get(scale, n as string, n)
  }
  const isNegative = n < 0
  const absolute = Math.abs(n)
  const value = get(scale, absolute, absolute)
  if (!isNumber(value)) {
    return isNegative ? '-' + value : value
  }
  return value * (isNegative ? -1 : 1)
}

const marginConfig: SystemConfig = {
  margin: { property: 'margin', scale: 'space', transform: getMargin, defaultScale: spaceScale },
  marginTop: {
    property: 'marginTop',
    scale: 'space',
    transform: getMargin,
    defaultScale: spaceScale,
  },
  marginRight: {
    property: 'marginRight',
    scale: 'space',
    transform: getMargin,
    defaultScale: spaceScale,
  },
  marginBottom: {
    property: 'marginBottom',
    scale: 'space',
    transform: getMargin,
    defaultScale: spaceScale,
  },
  marginLeft: {
    property: 'marginLeft',
    scale: 'space',
    transform: getMargin,
    defaultScale: spaceScale,
  },
  marginX: {
    properties: ['marginLeft', 'marginRight'],
    scale: 'space',
    transform: getMargin,
    defaultScale: spaceScale,
  },
  marginY: {
    properties: ['marginTop', 'marginBottom'],
    scale: 'space',
    transform: getMargin,
    defaultScale: spaceScale,
  },
}
marginConfig.m = marginConfig.margin
marginConfig.mt = marginConfig.marginTop
marginConfig.mr = marginConfig.marginRight
marginConfig.mb = marginConfig.marginBottom
marginConfig.ml = marginConfig.marginLeft
marginConfig.mx = marginConfig.marginX
marginConfig.my = marginConfig.marginY

const paddingConfig: SystemConfig = {
  padding: { property: 'padding', scale: 'space', defaultScale: spaceScale },
  paddingTop: { property: 'paddingTop', scale: 'space', defaultScale: spaceScale },
  paddingRight: { property: 'paddingRight', scale: 'space', defaultScale: spaceScale },
  paddingBottom: { property: 'paddingBottom', scale: 'space', defaultScale: spaceScale },
  paddingLeft: { property: 'paddingLeft', scale: 'space', defaultScale: spaceScale },
  paddingX: {
    properties: ['paddingLeft', 'paddingRight'],
    scale: 'space',
    defaultScale: spaceScale,
  },
  paddingY: {
    properties: ['paddingTop', 'paddingBottom'],
    scale: 'space',
    defaultScale: spaceScale,
  },
}
paddingConfig.p = paddingConfig.padding
paddingConfig.pt = paddingConfig.paddingTop
paddingConfig.pr = paddingConfig.paddingRight
paddingConfig.pb = paddingConfig.paddingBottom
paddingConfig.pl = paddingConfig.paddingLeft
paddingConfig.px = paddingConfig.paddingX
paddingConfig.py = paddingConfig.paddingY

// Not in upstream styled-system — flex/grid gaps resolve against the same
// space scale as margins and paddings.
const gapConfig: SystemConfig = {
  gap: { property: 'gap', scale: 'space', defaultScale: spaceScale },
  rowGap: { property: 'rowGap', scale: 'space', defaultScale: spaceScale },
  columnGap: { property: 'columnGap', scale: 'space', defaultScale: spaceScale },
}

export const margin = system(marginConfig)
export const padding = system(paddingConfig)
export const gap = system(gapConfig)
export const space = compose(margin, padding, gap)

export default space
