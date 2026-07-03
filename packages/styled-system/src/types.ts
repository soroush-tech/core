// First-class TypeScript types — the public surface that replaces @types/styled-system.
// Foundation types (Theme, ResponsiveValue, ThemeValue, ObjectOrArray) and the
// generic, theme-scale-aware prop interfaces mirror @types/styled-system@5.1.25 so this
// package is a drop-in replacement — including upstream's deliberately loose `any` on the
// props-facing surface, so consumers hit no strict-type friction.
//
// Structure mirrors upstream: one atomic interface per CSS property, with each grouped
// interface composing them via `extends`. Consumers can import either the group
// (`LayoutProps`) or a single property (`WidthProps`), from the main entry or the
// matching subpath. Three intentional widenings over upstream are preserved:
// `boxShadow`/`textShadow` and `fontWeight` additionally accept `string` theme keys.
import type * as CSS from 'csstype'

export type ObjectOrArray<T, K extends keyof any = keyof any> =
  | T[]
  | Record<K, T | Record<K, T> | T[]>

export type Scale = ObjectOrArray<number | string>

export type TLengthStyledSystem = string | number

export interface Theme<TLength = TLengthStyledSystem> {
  breakpoints?: ObjectOrArray<number | string | symbol>
  mediaQueries?: { [size: string]: string }
  space?: ObjectOrArray<CSS.Property.Margin<number | string>>
  fontSizes?: ObjectOrArray<CSS.Property.FontSize<number>>
  colors?: ObjectOrArray<CSS.Property.Color>
  fonts?: ObjectOrArray<CSS.Property.FontFamily>
  fontWeights?: ObjectOrArray<CSS.Property.FontWeight>
  lineHeights?: ObjectOrArray<CSS.Property.LineHeight<TLength>>
  letterSpacings?: ObjectOrArray<CSS.Property.LetterSpacing<TLength>>
  sizes?: ObjectOrArray<CSS.Property.Height<object> | CSS.Property.Width<object>>
  borders?: ObjectOrArray<CSS.Property.Border<object>>
  borderStyles?: ObjectOrArray<CSS.Property.Border<object>>
  borderWidths?: ObjectOrArray<CSS.Property.BorderWidth<TLength>>
  radii?: ObjectOrArray<CSS.Property.BorderRadius<TLength>>
  shadows?: ObjectOrArray<CSS.Property.BoxShadow>
  zIndices?: ObjectOrArray<CSS.Property.ZIndex>
  buttons?: ObjectOrArray<CSS.StandardProperties>
  colorStyles?: ObjectOrArray<CSS.StandardProperties>
  textStyles?: ObjectOrArray<CSS.StandardProperties>
}

export type RequiredTheme = Required<Theme>

export type ThemeValue<K extends keyof ThemeType, ThemeType, TVal = any> =
  NonNullable<ThemeType[K]> extends TVal[]
    ? number
    : NonNullable<ThemeType[K]> extends Record<infer E, TVal>
      ? E
      : NonNullable<ThemeType[K]> extends ObjectOrArray<infer F>
        ? F
        : never

export type ResponsiveValue<T, ThemeType extends Theme = RequiredTheme> =
  | T
  | null
  | Array<T | null>
  | { [key in (ThemeValue<'breakpoints', ThemeType> & string) | number]?: T }

// ---------------------------------------------------------------------------
// space
// ---------------------------------------------------------------------------

export interface MarginProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'space', ThemeType>,
> {
  m?: ResponsiveValue<TVal, ThemeType>
  margin?: ResponsiveValue<TVal, ThemeType>
  mt?: ResponsiveValue<TVal, ThemeType>
  marginTop?: ResponsiveValue<TVal, ThemeType>
  mr?: ResponsiveValue<TVal, ThemeType>
  marginRight?: ResponsiveValue<TVal, ThemeType>
  mb?: ResponsiveValue<TVal, ThemeType>
  marginBottom?: ResponsiveValue<TVal, ThemeType>
  ml?: ResponsiveValue<TVal, ThemeType>
  marginLeft?: ResponsiveValue<TVal, ThemeType>
  mx?: ResponsiveValue<TVal, ThemeType>
  marginX?: ResponsiveValue<TVal, ThemeType>
  my?: ResponsiveValue<TVal, ThemeType>
  marginY?: ResponsiveValue<TVal, ThemeType>
}

export interface PaddingProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'space', ThemeType>,
> {
  p?: ResponsiveValue<TVal, ThemeType>
  padding?: ResponsiveValue<TVal, ThemeType>
  pt?: ResponsiveValue<TVal, ThemeType>
  paddingTop?: ResponsiveValue<TVal, ThemeType>
  pr?: ResponsiveValue<TVal, ThemeType>
  paddingRight?: ResponsiveValue<TVal, ThemeType>
  pb?: ResponsiveValue<TVal, ThemeType>
  paddingBottom?: ResponsiveValue<TVal, ThemeType>
  pl?: ResponsiveValue<TVal, ThemeType>
  paddingLeft?: ResponsiveValue<TVal, ThemeType>
  px?: ResponsiveValue<TVal, ThemeType>
  paddingX?: ResponsiveValue<TVal, ThemeType>
  py?: ResponsiveValue<TVal, ThemeType>
  paddingY?: ResponsiveValue<TVal, ThemeType>
}

export interface SpaceProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'space', ThemeType>,
>
  extends MarginProps<ThemeType, TVal>, PaddingProps<ThemeType, TVal> {}

// ---------------------------------------------------------------------------
// layout
// ---------------------------------------------------------------------------

export interface WidthProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Width<TLengthStyledSystem>,
> {
  width?: ResponsiveValue<TVal, ThemeType>
}

export interface HeightProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Height<TLengthStyledSystem>,
> {
  height?: ResponsiveValue<TVal, ThemeType>
}

export interface MinWidthProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.MinWidth<TLengthStyledSystem>,
> {
  minWidth?: ResponsiveValue<TVal, ThemeType>
}

export interface MinHeightProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.MinHeight<TLengthStyledSystem>,
> {
  minHeight?: ResponsiveValue<TVal, ThemeType>
}

export interface MaxWidthProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.MaxWidth<TLengthStyledSystem>,
> {
  maxWidth?: ResponsiveValue<TVal, ThemeType>
}

export interface MaxHeightProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.MaxHeight<TLengthStyledSystem>,
> {
  maxHeight?: ResponsiveValue<TVal, ThemeType>
}

export interface SizeProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Height<TLengthStyledSystem>,
> {
  size?: ResponsiveValue<TVal, ThemeType>
}

export interface DisplayProps<ThemeType extends Theme = RequiredTheme> {
  display?: ResponsiveValue<CSS.Property.Display, ThemeType>
}

export interface OverflowProps<ThemeType extends Theme = RequiredTheme> {
  overflow?: ResponsiveValue<CSS.Property.Overflow, ThemeType>
  overflowX?: ResponsiveValue<CSS.Property.OverflowX, ThemeType>
  overflowY?: ResponsiveValue<CSS.Property.OverflowY, ThemeType>
}

export interface VerticalAlignProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.VerticalAlign<TLengthStyledSystem>,
> {
  verticalAlign?: ResponsiveValue<TVal, ThemeType>
}

export interface LayoutProps<ThemeType extends Theme = RequiredTheme>
  extends
    WidthProps<ThemeType>,
    HeightProps<ThemeType>,
    MinWidthProps<ThemeType>,
    MinHeightProps<ThemeType>,
    MaxWidthProps<ThemeType>,
    MaxHeightProps<ThemeType>,
    DisplayProps<ThemeType>,
    VerticalAlignProps<ThemeType>,
    SizeProps<ThemeType>,
    OverflowProps<ThemeType> {}

// ---------------------------------------------------------------------------
// typography
// ---------------------------------------------------------------------------

export interface FontFamilyProps<ThemeType extends Theme = RequiredTheme> {
  fontFamily?: ResponsiveValue<CSS.Property.FontFamily, ThemeType>
}

export interface FontSizeProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'fontSizes', ThemeType>,
> {
  fontSize?: ResponsiveValue<TVal, ThemeType>
}

// `string | number` so it resolves against both object-keyed and array-indexed
// theme.fontWeights scales, plus raw CSS font-weight values (e.g. `700`, `'bold'`).
export interface FontWeightProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'fontWeights', ThemeType> | string | number,
> {
  fontWeight?: ResponsiveValue<TVal, ThemeType>
}

export interface LineHeightProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'lineHeights', ThemeType>,
> {
  lineHeight?: ResponsiveValue<TVal, ThemeType>
}

export interface LetterSpacingProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.LetterSpacing<TLengthStyledSystem>,
> {
  letterSpacing?: ResponsiveValue<TVal, ThemeType>
}

export interface FontStyleProps<ThemeType extends Theme = RequiredTheme> {
  fontStyle?: ResponsiveValue<CSS.Property.FontStyle, ThemeType>
}

export interface TextAlignProps<ThemeType extends Theme = RequiredTheme> {
  textAlign?: ResponsiveValue<CSS.Property.TextAlign, ThemeType>
}

export interface TypographyProps<ThemeType extends Theme = RequiredTheme>
  extends
    FontFamilyProps<ThemeType>,
    FontSizeProps<ThemeType>,
    FontWeightProps<ThemeType>,
    LineHeightProps<ThemeType>,
    LetterSpacingProps<ThemeType>,
    FontStyleProps<ThemeType>,
    TextAlignProps<ThemeType> {}

// ---------------------------------------------------------------------------
// flexbox
// ---------------------------------------------------------------------------

export interface AlignItemsProps<ThemeType extends Theme = RequiredTheme> {
  alignItems?: ResponsiveValue<CSS.Property.AlignItems, ThemeType>
}

export interface AlignContentProps<ThemeType extends Theme = RequiredTheme> {
  alignContent?: ResponsiveValue<CSS.Property.AlignContent, ThemeType>
}

export interface JustifyItemsProps<ThemeType extends Theme = RequiredTheme> {
  justifyItems?: ResponsiveValue<CSS.Property.JustifyItems, ThemeType>
}

export interface JustifyContentProps<ThemeType extends Theme = RequiredTheme> {
  justifyContent?: ResponsiveValue<CSS.Property.JustifyContent, ThemeType>
}

export interface FlexWrapProps<ThemeType extends Theme = RequiredTheme> {
  flexWrap?: ResponsiveValue<CSS.Property.FlexWrap, ThemeType>
}

export interface FlexDirectionProps<ThemeType extends Theme = RequiredTheme> {
  flexDirection?: ResponsiveValue<CSS.Property.FlexDirection, ThemeType>
}

export interface FlexProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Flex<TLengthStyledSystem>,
> {
  flex?: ResponsiveValue<TVal, ThemeType>
}

export interface FlexGrowProps<ThemeType extends Theme = RequiredTheme> {
  flexGrow?: ResponsiveValue<CSS.Property.FlexGrow, ThemeType>
}

export interface FlexShrinkProps<ThemeType extends Theme = RequiredTheme> {
  flexShrink?: ResponsiveValue<CSS.Property.FlexShrink, ThemeType>
}

export interface FlexBasisProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.FlexBasis<TLengthStyledSystem>,
> {
  flexBasis?: ResponsiveValue<TVal, ThemeType>
}

export interface JustifySelfProps<ThemeType extends Theme = RequiredTheme> {
  justifySelf?: ResponsiveValue<CSS.Property.JustifySelf, ThemeType>
}

export interface AlignSelfProps<ThemeType extends Theme = RequiredTheme> {
  alignSelf?: ResponsiveValue<CSS.Property.AlignSelf, ThemeType>
}

export interface OrderProps<ThemeType extends Theme = RequiredTheme> {
  order?: ResponsiveValue<CSS.Property.Order, ThemeType>
}

export interface FlexboxProps<ThemeType extends Theme = RequiredTheme>
  extends
    AlignItemsProps<ThemeType>,
    AlignContentProps<ThemeType>,
    JustifyItemsProps<ThemeType>,
    JustifyContentProps<ThemeType>,
    FlexWrapProps<ThemeType>,
    FlexDirectionProps<ThemeType>,
    FlexProps<ThemeType>,
    FlexGrowProps<ThemeType>,
    FlexShrinkProps<ThemeType>,
    FlexBasisProps<ThemeType>,
    JustifySelfProps<ThemeType>,
    AlignSelfProps<ThemeType>,
    OrderProps<ThemeType> {}

// ---------------------------------------------------------------------------
// position
// ---------------------------------------------------------------------------

export interface ZIndexProps<ThemeType extends Theme = RequiredTheme> {
  zIndex?: ResponsiveValue<CSS.Property.ZIndex, ThemeType>
}

export interface TopProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Top<TLengthStyledSystem>,
> {
  top?: ResponsiveValue<TVal, ThemeType>
}

export interface RightProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Right<TLengthStyledSystem>,
> {
  right?: ResponsiveValue<TVal, ThemeType>
}

export interface BottomProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Bottom<TLengthStyledSystem>,
> {
  bottom?: ResponsiveValue<TVal, ThemeType>
}

export interface LeftProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Left<TLengthStyledSystem>,
> {
  left?: ResponsiveValue<TVal, ThemeType>
}

export interface PositionProps<ThemeType extends Theme = RequiredTheme>
  extends
    ZIndexProps<ThemeType>,
    TopProps<ThemeType>,
    RightProps<ThemeType>,
    BottomProps<ThemeType>,
    LeftProps<ThemeType> {
  position?: ResponsiveValue<CSS.Property.Position, ThemeType>
}

// ---------------------------------------------------------------------------
// color
// ---------------------------------------------------------------------------

export interface TextColorProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'colors', ThemeType>,
> {
  color?: ResponsiveValue<TVal, ThemeType>
}

export interface BackgroundColorProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'colors', ThemeType>,
> {
  bg?: ResponsiveValue<TVal, ThemeType>
  backgroundColor?: ResponsiveValue<TVal, ThemeType>
}

export interface OpacityProps<ThemeType extends Theme = RequiredTheme> {
  opacity?: ResponsiveValue<CSS.Property.Opacity, ThemeType>
}

export interface ColorProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'colors', ThemeType>,
>
  extends
    TextColorProps<ThemeType, TVal>,
    BackgroundColorProps<ThemeType, TVal>,
    OpacityProps<ThemeType> {}

// ---------------------------------------------------------------------------
// border
// ---------------------------------------------------------------------------

export interface BorderWidthProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'borderWidths', ThemeType>,
> {
  borderWidth?: ResponsiveValue<TVal, ThemeType>
  borderTopWidth?: ResponsiveValue<TVal, ThemeType>
  borderBottomWidth?: ResponsiveValue<TVal, ThemeType>
  borderLeftWidth?: ResponsiveValue<TVal, ThemeType>
  borderRightWidth?: ResponsiveValue<TVal, ThemeType>
}

export interface BorderStyleProps<ThemeType extends Theme = RequiredTheme> {
  borderStyle?: ResponsiveValue<CSS.Property.BorderStyle, ThemeType>
  borderTopStyle?: ResponsiveValue<CSS.Property.BorderTopStyle, ThemeType>
  borderBottomStyle?: ResponsiveValue<CSS.Property.BorderBottomStyle, ThemeType>
  borderLeftStyle?: ResponsiveValue<CSS.Property.BorderLeftStyle, ThemeType>
  borderRightStyle?: ResponsiveValue<CSS.Property.BorderRightStyle, ThemeType>
}

export interface BorderColorProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'colors', ThemeType>,
> {
  borderColor?: ResponsiveValue<TVal, ThemeType>
  borderTopColor?: ResponsiveValue<TVal, ThemeType>
  borderBottomColor?: ResponsiveValue<TVal, ThemeType>
  borderLeftColor?: ResponsiveValue<TVal, ThemeType>
  borderRightColor?: ResponsiveValue<TVal, ThemeType>
}

export interface BorderRadiusProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = ThemeValue<'radii', ThemeType>,
> {
  borderRadius?: ResponsiveValue<TVal, ThemeType>
  borderTopLeftRadius?: ResponsiveValue<TVal, ThemeType>
  borderTopRightRadius?: ResponsiveValue<TVal, ThemeType>
  borderBottomLeftRadius?: ResponsiveValue<TVal, ThemeType>
  borderBottomRightRadius?: ResponsiveValue<TVal, ThemeType>
}

export interface BorderTopProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.BorderTop<TLengthStyledSystem>,
> {
  borderTop?: ResponsiveValue<TVal, ThemeType>
}

export interface BorderRightProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.BorderRight<TLengthStyledSystem>,
> {
  borderRight?: ResponsiveValue<TVal, ThemeType>
}

export interface BorderBottomProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.BorderBottom<TLengthStyledSystem>,
> {
  borderBottom?: ResponsiveValue<TVal, ThemeType>
}

export interface BorderLeftProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.BorderLeft<TLengthStyledSystem>,
> {
  borderLeft?: ResponsiveValue<TVal, ThemeType>
}

export interface BorderProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Border<TLengthStyledSystem>,
>
  extends
    BorderWidthProps<ThemeType>,
    BorderStyleProps<ThemeType>,
    BorderColorProps<ThemeType>,
    BorderRadiusProps<ThemeType>,
    BorderTopProps<ThemeType>,
    BorderRightProps<ThemeType>,
    BorderBottomProps<ThemeType>,
    BorderLeftProps<ThemeType> {
  border?: ResponsiveValue<TVal, ThemeType>
  borderX?: ResponsiveValue<TVal, ThemeType>
  borderY?: ResponsiveValue<TVal, ThemeType>
}

// ---------------------------------------------------------------------------
// background
// ---------------------------------------------------------------------------

export interface BackgroundImageProps<ThemeType extends Theme = RequiredTheme> {
  backgroundImage?: ResponsiveValue<CSS.Property.BackgroundImage, ThemeType>
}

export interface BackgroundSizeProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.BackgroundSize<TLengthStyledSystem>,
> {
  backgroundSize?: ResponsiveValue<TVal, ThemeType>
}

export interface BackgroundPositionProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.BackgroundPosition<TLengthStyledSystem>,
> {
  backgroundPosition?: ResponsiveValue<TVal, ThemeType>
}

export interface BackgroundRepeatProps<ThemeType extends Theme = RequiredTheme> {
  backgroundRepeat?: ResponsiveValue<CSS.Property.BackgroundRepeat, ThemeType>
}

export interface BackgroundProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.Background<TLengthStyledSystem>,
>
  extends
    BackgroundImageProps<ThemeType>,
    BackgroundSizeProps<ThemeType>,
    BackgroundPositionProps<ThemeType>,
    BackgroundRepeatProps<ThemeType> {
  background?: ResponsiveValue<TVal, ThemeType>
}

// ---------------------------------------------------------------------------
// grid
// ---------------------------------------------------------------------------

export interface GridGapProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.GridGap<TLengthStyledSystem>,
> {
  gridGap?: ResponsiveValue<TVal, ThemeType>
}

export interface GridColumnGapProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.GridColumnGap<TLengthStyledSystem>,
> {
  gridColumnGap?: ResponsiveValue<TVal, ThemeType>
}

export interface GridRowGapProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.GridRowGap<TLengthStyledSystem>,
> {
  gridRowGap?: ResponsiveValue<TVal, ThemeType>
}

export interface GridColumnProps<ThemeType extends Theme = RequiredTheme> {
  gridColumn?: ResponsiveValue<CSS.Property.GridColumn, ThemeType>
}

export interface GridRowProps<ThemeType extends Theme = RequiredTheme> {
  gridRow?: ResponsiveValue<CSS.Property.GridRow, ThemeType>
}

export interface GridAutoFlowProps<ThemeType extends Theme = RequiredTheme> {
  gridAutoFlow?: ResponsiveValue<CSS.Property.GridAutoFlow, ThemeType>
}

export interface GridAutoColumnsProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.GridAutoColumns<TLengthStyledSystem>,
> {
  gridAutoColumns?: ResponsiveValue<TVal, ThemeType>
}

export interface GridAutoRowsProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.GridAutoRows<TLengthStyledSystem>,
> {
  gridAutoRows?: ResponsiveValue<TVal, ThemeType>
}

export interface GridTemplateColumnsProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.GridTemplateColumns<TLengthStyledSystem>,
> {
  gridTemplateColumns?: ResponsiveValue<TVal, ThemeType>
}

export interface GridTemplateRowsProps<
  ThemeType extends Theme = RequiredTheme,
  TVal = CSS.Property.GridTemplateRows<TLengthStyledSystem>,
> {
  gridTemplateRows?: ResponsiveValue<TVal, ThemeType>
}

export interface GridTemplateAreasProps<ThemeType extends Theme = RequiredTheme> {
  gridTemplateAreas?: ResponsiveValue<CSS.Property.GridTemplateAreas, ThemeType>
}

export interface GridAreaProps<ThemeType extends Theme = RequiredTheme> {
  gridArea?: ResponsiveValue<CSS.Property.GridArea, ThemeType>
}

export interface GridProps<ThemeType extends Theme = RequiredTheme>
  extends
    GridGapProps<ThemeType>,
    GridColumnGapProps<ThemeType>,
    GridRowGapProps<ThemeType>,
    GridColumnProps<ThemeType>,
    GridRowProps<ThemeType>,
    GridAutoFlowProps<ThemeType>,
    GridAutoColumnsProps<ThemeType>,
    GridAutoRowsProps<ThemeType>,
    GridTemplateColumnsProps<ThemeType>,
    GridTemplateRowsProps<ThemeType>,
    GridTemplateAreasProps<ThemeType>,
    GridAreaProps<ThemeType> {}

// ---------------------------------------------------------------------------
// shadow
// ---------------------------------------------------------------------------

// `string | number` so it resolves against both object-keyed (`{ sm, md }`) and
// array-indexed (`[…]`) theme.shadows scales, plus raw CSS values.
export interface BoxShadowProps<ThemeType extends Theme = RequiredTheme> {
  boxShadow?: ResponsiveValue<CSS.Property.BoxShadow | string | number, ThemeType>
}

// `string | number` so it resolves against both object-keyed and array-indexed scales.
export interface TextShadowProps<ThemeType extends Theme = RequiredTheme> {
  textShadow?: ResponsiveValue<CSS.Property.TextShadow | string | number, ThemeType>
}

export interface ShadowProps<ThemeType extends Theme = RequiredTheme>
  extends BoxShadowProps<ThemeType>, TextShadowProps<ThemeType> {}

// ---------------------------------------------------------------------------
// variant
// ---------------------------------------------------------------------------

export interface TextStyleProps<ThemeType extends Theme = RequiredTheme> {
  textStyle?: ResponsiveValue<string, ThemeType>
}

export interface ButtonStyleProps<ThemeType extends Theme = RequiredTheme> {
  variant?: ResponsiveValue<string, ThemeType>
}

export interface ColorStyleProps<ThemeType extends Theme = RequiredTheme> {
  colors?: ResponsiveValue<string, ThemeType>
}
