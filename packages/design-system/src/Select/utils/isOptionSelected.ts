/** The union of value shapes `Select` holds: a single value, or an array in multiple mode. */
export type SelectValue = string | number | Array<string | number>

/** True when `optionValue` is the current single value, or is contained in the multiple-mode array. */
export function isOptionSelected(value: SelectValue, optionValue: string | number): boolean {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue
}
