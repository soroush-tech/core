import { Children, isValidElement, type ReactNode } from 'react'
import { type MenuItemProps } from '../../MenuItem'

export interface SelectOption {
  value: string | number
  label: ReactNode
  disabled: boolean
}

/**
 * Flattens `Select`'s `MenuItem` children into a plain option list. Any child that
 * is not a valid element carrying a `value` prop (e.g. whitespace, `null`) is skipped,
 * so the returned indices line up with the rendered, selectable rows.
 */
export function getOptionsFromChildren(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return []
    }
    const props = child.props as MenuItemProps
    if (props.value === undefined) {
      return []
    }
    return [{ value: props.value, label: props.children, disabled: props.disabled ?? false }]
  })
}
