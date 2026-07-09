import { type ReactNode } from 'react'
import { type SelectOption } from './getOptionsFromChildren'
import { type SelectValue } from './isOptionSelected'

/**
 * The label(s) to show in the trigger for the current `value`, or `null` when nothing
 * is selected (the caller then falls back to the placeholder). Multiple-mode selections
 * are joined in option order with `, `.
 */
export function resolveDisplayLabel(options: SelectOption[], value: SelectValue): ReactNode {
  if (Array.isArray(value)) {
    const selected = options.filter((option) => value.includes(option.value))
    if (selected.length === 0) {
      return null
    }
    return selected
      .map((option) => option.label)
      .reduce<ReactNode[]>((acc, label, index) => {
        if (index > 0) {
          acc.push(', ')
        }
        acc.push(label)
        return acc
      }, [])
  }

  const match = options.find((option) => option.value === value)
  return match ? match.label : null
}
