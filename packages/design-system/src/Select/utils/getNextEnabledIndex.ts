import { type SelectOption } from './getOptionsFromChildren'

/**
 * Walks `options` from `from` by `step` (+1 / -1), skipping disabled rows, and
 * returns the first enabled index reached. Stops at the edges (no wrap-around);
 * returns `from` when no enabled option lies in that direction.
 */
export function getNextEnabledIndex(options: SelectOption[], from: number, step: 1 | -1): number {
  for (let next = from + step; next >= 0 && next < options.length; next += step) {
    if (!options[next].disabled) {
      return next
    }
  }
  return from
}

/** First (`'first'`) or last (`'last'`) enabled index, or `-1` when every option is disabled. */
export function getEdgeEnabledIndex(options: SelectOption[], edge: 'first' | 'last'): number {
  if (edge === 'first') {
    return options.findIndex((option) => !option.disabled)
  }
  for (let index = options.length - 1; index >= 0; index -= 1) {
    if (!options[index].disabled) {
      return index
    }
  }
  return -1
}
