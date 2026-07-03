import {
  createParser,
  createStyleFunction,
  type ParserConfig,
  type Parser,
  type Transform,
} from '@soroush.tech/styled-system/core'

export interface StyleOptions {
  prop: string
  cssProperty?: string
  alias?: string
  key?: string
  transformValue?: Transform
  scale?: unknown
  properties?: string[]
}

/** Upstream `@types/styled-system` name for {@link StyleOptions}. */
export type LowLevelStyleFunctionArguments = StyleOptions

// v4 style() API shim.
export const style = ({
  prop,
  cssProperty,
  alias,
  key,
  transformValue,
  scale,
  properties,
}: StyleOptions): Parser => {
  const config: ParserConfig = {}
  config[prop] = createStyleFunction({
    properties,
    property: cssProperty || prop,
    scale: key,
    defaultScale: scale,
    transform: transformValue,
  })
  if (alias) config[alias] = config[prop]
  return createParser(config)
}

export default style
