import { createParser, get, type Parser, type StyleFn } from '@soroush.tech/styled-system/core'
import { css } from '@soroush.tech/styled-system/css'

export interface VariantOptions {
  scale?: string
  prop?: string
  variants?: Record<string, unknown>
  key?: string
}

/** Upstream `@types/styled-system` name for {@link VariantOptions}. */
export type VariantArgs = VariantOptions

export const variant = (options: VariantOptions = {}): Parser => {
  const { scale, prop = 'variant', variants = {}, key } = options
  const useCss = Object.keys(variants).length > 0
  const sx = ((value: unknown, scaleArg: unknown, props?: { theme?: unknown }) =>
    useCss
      ? css(get(scaleArg, value as string, null) as Parameters<typeof css>[0])(
          props?.theme as Record<string, unknown>
        )
      : get(scaleArg, value as string, null)) as StyleFn
  sx.scale = scale || key
  sx.defaults = variants
  return createParser({ [prop]: sx })
}

export default variant

export const buttonStyle = variant({ key: 'buttons' })
export const textStyle = variant({ key: 'textStyles', prop: 'textStyle' })
export const colorStyle = variant({ key: 'colorStyles', prop: 'colors' })
