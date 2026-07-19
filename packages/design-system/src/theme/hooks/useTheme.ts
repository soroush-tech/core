import { useEmotionTheme } from '../emotion'
import type { Theme } from '../themes'

/**
 * The active theme, typed as this package's own `Theme` — Emotion is an
 * internal implementation detail, never part of the public type surface.
 */
export const useTheme = (): Theme => useEmotionTheme() as unknown as Theme
