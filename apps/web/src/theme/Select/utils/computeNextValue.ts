import { type SelectValue } from './isOptionSelected'

/**
 * The value that results from choosing `optionValue`.
 * - Multiple mode: toggles `optionValue` in/out of the array, preserving order.
 * - Single mode: replaces the value outright.
 */
export function computeNextValue(value: SelectValue, optionValue: string | number): SelectValue {
  if (!Array.isArray(value)) {
    return optionValue
  }
  return value.includes(optionValue)
    ? value.filter((item) => item !== optionValue)
    : [...value, optionValue]
}
