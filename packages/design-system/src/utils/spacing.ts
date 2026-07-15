/** The default `theme.space` steps. Kept for back-compat; `spacing()` accepts any
 * number so values can be built for consumer-augmented space keys. */
export type SpaceUnits = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export const spacing = (units: number) => `${8 * units}px`
