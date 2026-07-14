import { clamp } from './clamp'

/**
 * Appends an alpha channel to a 6-digit hex color, producing an 8-digit `#RRGGBBAA` hex.
 * @param color - 6-digit hex string, e.g. `'#4ade80'`
 * @param opacity - alpha from `0` (transparent) to `1` (opaque)
 * @returns 8-digit hex string, e.g. `'#4ade801A'`
 * @example alpha('#4ade80', 0.1) // '#4ade801A'
 */
export const alpha = (color: string, opacity: number): string => {
  const channel = Math.round(clamp(opacity, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()
  return `${color}${channel}`
}
