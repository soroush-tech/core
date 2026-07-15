import emotionStyled from '@emotion/styled'
import type {
  CreateStyled as EmotionCreateStyled,
  CreateStyledComponent,
  FilteringStyledOptions,
  Interpolation,
  StyledOptions,
} from '@emotion/styled'
import type { PropsOf, Theme } from '@emotion/react'
import type { ComponentClass, ComponentProps, ComponentType, JSX, Ref } from 'react'

/**
 * Design-system additions to Emotion's styled options. A styled root that passes
 * `name` becomes theme-customizable: `theme.components[name]` may contribute
 * `styleOverrides` (per `slot`) and `variants`, appended after the component's
 * own styles so the theme wins the cascade. Roots without `name` are plain
 * Emotion — zero behavior change, zero cost.
 */
export interface ThemeCustomizationOptions {
  /** `theme.components` key enabling styleOverrides/variants for this root. */
  name?: string
  /** The `styleOverrides` slot this root maps to. Default: `'root'`. */
  slot?: string
  /**
   * Styled-system prop parsers (`space`, `layout`, …) appended AFTER the theme
   * override resolver, so per-instance props (`m`, `p`, `width`, …) always beat
   * theme `styleOverrides`.
   */
  systemProps?: ReadonlyArray<Interpolation<never>>
  /**
   * Custom mapping from render props to applied override styles — replaces the
   * default `styleOverrides[slot]` lookup (for prop-keyed override keys).
   */
  overridesResolver?: (
    props: Record<string, unknown>,
    styleOverrides: Record<string, unknown>
  ) => unknown
}

interface ComponentThemeConfig {
  styleOverrides?: Record<string, unknown>
  variants?: ReadonlyArray<{ props: Record<string, unknown>; style: unknown }>
}

const resolveStyle = (style: unknown, props: Record<string, unknown>) =>
  typeof style === 'function' ? style({ theme: props.theme, ownerState: props }) : style

const matchesProps = (props: Record<string, unknown>, matcher: Record<string, unknown>) =>
  Object.entries(matcher).every(([key, value]) => props[key] === value)

/** Overloads mirroring Emotion's, with the theme-customization options added. */
interface CreateThemedStyled extends EmotionCreateStyled {
  <
    C extends ComponentClass<ComponentProps<C>>,
    ForwardedProps extends keyof ComponentProps<C> & string = keyof ComponentProps<C> & string,
  >(
    component: C,
    options: FilteringStyledOptions<ComponentProps<C>, ForwardedProps> & ThemeCustomizationOptions
  ): CreateStyledComponent<
    Pick<PropsOf<C>, ForwardedProps> & { theme?: Theme },
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- mirrors Emotion's own overload shape
    {},
    { ref?: Ref<InstanceType<C>> }
  >
  <
    C extends ComponentType<ComponentProps<C>>,
    ForwardedProps extends keyof ComponentProps<C> & string = keyof ComponentProps<C> & string,
  >(
    component: C,
    options: FilteringStyledOptions<ComponentProps<C>, ForwardedProps> & ThemeCustomizationOptions
  ): CreateStyledComponent<Pick<PropsOf<C>, ForwardedProps> & { theme?: Theme }>
  // Component + plain options — `shouldForwardProp` may be a boolean predicate
  // (no type-predicate narrowing), mirroring Emotion's non-filtering overload.
  <C extends ComponentType<ComponentProps<C>>>(
    component: C,
    options?: StyledOptions<ComponentProps<C>> & ThemeCustomizationOptions
  ): CreateStyledComponent<PropsOf<C> & { theme?: Theme }>
  <
    Tag extends keyof JSX.IntrinsicElements,
    ForwardedProps extends keyof JSX.IntrinsicElements[Tag] & string =
      keyof JSX.IntrinsicElements[Tag] & string,
  >(
    tag: Tag,
    options: FilteringStyledOptions<JSX.IntrinsicElements[Tag], ForwardedProps> &
      ThemeCustomizationOptions
  ): CreateStyledComponent<
    { theme?: Theme; as?: React.ElementType },
    Pick<JSX.IntrinsicElements[Tag], ForwardedProps>
  >
  <Tag extends keyof JSX.IntrinsicElements>(
    tag: Tag,
    options?: StyledOptions<JSX.IntrinsicElements[Tag]> & ThemeCustomizationOptions
  ): CreateStyledComponent<{ theme?: Theme; as?: React.ElementType }, JSX.IntrinsicElements[Tag]>
}

const createThemedStyled = (
  tag: never,
  options: (StyledOptions & ThemeCustomizationOptions) | undefined = {}
) => {
  const { name, slot = 'root', systemProps = [], overridesResolver, ...emotionOptions } = options
  const create = emotionStyled(tag, emotionOptions)
  if (name === undefined) {
    return create
  }

  // Appended after the component's own styles (theme wins) and before
  // `systemProps` (per-instance props win over the theme).
  const themeStyles = (props: Record<string, unknown> & { theme: Theme }) => {
    const components = props.theme.components as
      Record<string, ComponentThemeConfig | undefined> | undefined
    const config = components?.[name]
    if (!config) {
      return null
    }
    const applied: unknown[] = []
    if (config.styleOverrides) {
      applied.push(
        overridesResolver
          ? overridesResolver(props, config.styleOverrides)
          : resolveStyle(config.styleOverrides[slot], props)
      )
    }
    if (slot === 'root' && config.variants) {
      for (const entry of config.variants) {
        if (matchesProps(props, entry.props)) {
          applied.push(resolveStyle(entry.style, props))
        }
      }
    }
    return applied as Interpolation<never>
  }

  return (...styles: ReadonlyArray<Interpolation<never>>) =>
    create(...styles, themeStyles as Interpolation<never>, ...systemProps)
}

/**
 * The design system's `styled` — Emotion's styled plus theme-level component
 * customization (`theme.components[name].styleOverrides` / `.variants`).
 */
export const styled: CreateThemedStyled = Object.assign(
  createThemedStyled as unknown as EmotionCreateStyled,
  emotionStyled
)
