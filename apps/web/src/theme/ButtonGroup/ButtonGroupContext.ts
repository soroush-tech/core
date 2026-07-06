import { createContext } from 'react'
import type { ButtonVariant, ButtonColor, ButtonSize } from 'src/theme/Button'

/** Group-wide defaults provided by `ButtonGroup` and consumed by `Button` (explicit props win). */
export interface ButtonGroupContextValue {
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  disabled?: boolean
  fullWidth?: boolean
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue>({})
