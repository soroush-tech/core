// Type-level test: style props survive tsdown's d.ts chunking on the per-component
// subpaths. Runs via `pnpm test:types` (builds dist first, then typechecks this
// isolated program).
//
// The prop groups come from @soroush.tech/styled-system, and components import them
// straight from there — importing them through the barrel instead puts them inside
// the `declare namespace` tsdown synthesizes for it, which cannot hold the barrel's
// `export *`, so the names go missing from the build. Under `skipLibCheck` (what
// consumers compile with, and what this program mirrors) those dangling references
// degrade to `any` instead of erroring: every style prop disappears, and a
// `Pick<LayoutProps, …>` turns into required members. scripts/check-dts.mjs catches
// that shape anywhere in the build; this file pins the consumer-visible symptom.
import type { GridProps } from '@soroush.tech/design-system/Grid'
import type { ImageProps } from '@soroush.tech/design-system/Image'
import type { SkeletonProps } from '@soroush.tech/design-system/Skeleton'
import type { TextInputProps } from '@soroush.tech/design-system/TextInput'
import type { TypographyProps } from '@soroush.tech/design-system/Typography'

// Style props are optional: a `Pick<LayoutProps<Theme>, …>` degraded to `Pick<any, …>`
// would make width / minWidth / maxWidth required here.
export const input: TextInputProps = {}

// …and they exist. Excess-property checking catches the other direction — a base
// that degraded to `any` contributes no members, so each literal below would fail.
export const text: TypographyProps = {
  mt: 2, // SpaceProps
  width: '100%', // LayoutProps
  fontFamily: 'body', // TypographyProps
  flexGrow: 1, // FlexboxProps
  borderTop: '1px solid', // BorderProps
  position: 'relative', // PositionProps
}
export const image: ImageProps = { background: 'none' } // BackgroundProps
export const grid: GridProps = { gridTemplateColumns: 'repeat(2, 1fr)' } // GridProps
export const skeleton: SkeletonProps = { mt: 2 } // SpaceProps minus PaddingProps
