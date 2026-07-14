import { createContext } from 'react'

export type ToggleButtonValue = string | number

/**
 * Selection state provided by `ToggleButtonGroup` and consumed by `ToggleButton`.
 * Visual config (color / size / disabled / fullWidth) travels via `ButtonGroupContext`.
 */
export interface ToggleButtonGroupContextValue {
  /** Selected value(s) — single when exclusive, array otherwise. */
  value?: ToggleButtonValue | ToggleButtonValue[] | null
  /** Fired with the clicked button's value — the group resolves the next selection. */
  onToggle?: (value: ToggleButtonValue) => void
}

export const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextValue>({})
