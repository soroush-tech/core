// Internal-only Emotion bindings — the single seam for swapping the CSS-in-JS
// engine. Not part of the public API (no package.json export maps to this
// file): consumers use `styled`, `css`, `keyframes` from the package root,
// `ThemeProvider`/`useTheme`/theme hooks from the `./theme` subpath, or
// `Global`/`CacheProvider` from the `./engine` subpath — all typed against
// this package's own `Theme`.
import { Global as EmotionGlobal } from '@emotion/react'
import type { Interpolation } from '@emotion/react'
import type { ComponentType, RefAttributes } from 'react'
import type { Theme } from './themes'

export {
  useTheme as useEmotionTheme,
  CacheProvider,
  ThemeProvider as EmotionThemeProvider,
  ThemeContext as EmotionThemeContext,
} from '@emotion/react'

/** `Global`, retyped against this package's own `Theme` (see `styled.ts`'s `StyledTags`). */
export const Global = EmotionGlobal as ComponentType<
  { styles: Interpolation<Theme> } & RefAttributes<unknown>
>
